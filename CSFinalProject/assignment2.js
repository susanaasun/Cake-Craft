import { defs, tiny } from "./examples/common.js";

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Shader,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
} = tiny;

export class Elements extends Scene {
  constructor() {
    super();

    this.shapes = {
      coal: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(
        2,
      ),
      oven: new Cube(),
      ovenrack: new defs.Capped_Cylinder(20, 10),
      plate: new defs.Capped_Cylinder(50, 50),
      cherry: new defs.Subdivision_Sphere(4),
      strawberry: new defs.Rounded_Closed_Cone(20,20), // Corrected parameters
      cake: new defs.Capped_Cylinder(50, 50), // Added second parameter for slices
      candle: new defs.Capped_Cylinder(20, 10), // Added second parameter for slices
      flame: new defs.Rounded_Closed_Cone(4, 10),
    };

    this.materials = {
      coal: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 1,
        color: hex_color("#ff8037"),
      }),

      oven: new Material(new defs.Phong_Shader(), {
        ambient: 0.2,
        diffusivity: 0.5,
        specularity: 1,
        color: hex_color("#5E5E5E"),
      }),

      ovenrack: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0.5,
        specularity: 1,
        color: hex_color("#c8c8c8"),
      }),

      plate: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.7,
        color: hex_color("#FFC0CB"),
      }),

      cherry: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 1,
        color: hex_color("#B62625"),
      }),

      strawberry: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 1,
        color: hex_color("#C54644"),
      }),

      cake: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 1,
        color: hex_color("#faf3eb"),
      }),

      candle: new Material(new defs.Phong_Shader(), {
        ambient: 0.2,
        diffusivity: 1,
        color: hex_color("#A4D6E9"),
      }),

      flame: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 1,
        color: hex_color("#ff5b47"),
      }),
    };

    // Cake Parameters
    this.layer_height = 1;
    this.layer_width = 3;
    this.layer_depth = 3;
    this.layer_color = hex_color("#faf3eb");
    this.layer_count = 1;

    // Toppings
    this.draw_cherry = false;
    this.draw_strawberry = false;

    // Baking Time
    this.total_baking = 0;
    this.baking_done = false;
    this.baking_start_time = null;
  }
}

class Base_Scene extends Scene {
  constructor() {
    super();
    this.hover = this.swarm = false;

    // *** Materials
    this.materials = {
      plastic: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
      }),
    };

    // The white material and basic shader are used for drawing the outline.
    this.white = new Material(new defs.Basic_Shader());
  }

  display(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls()),
      );
      program_state.set_camera(Mat4.translation(5, -10, -30));
    }
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100,
    );

    program_state.lights = [
      new Light(vec4(0, 5, 5, 1), color(1, 1, 1, 1), 1000),
      new Light(vec4(0, 5, 10, 1), color(1, 1, 1, 1), 6000),
      // new Light(vec4(5, 5, -10, 1), color(1, 1, 1, 1), 6000),
      new Light(vec4(0, 0, 0, 1), (1, 1, 1, 1), 1000),
    ];
  }
}

export class Assignment2 extends Base_Scene {
  constructor() {
    super();
    this.elements = new Elements();

    this.layer_color = hex_color("#faf3eb");
    this.layer_count = 3;
    this.layer_height = 1;
    this.layer_radius = 3;
    this.total_baking = 0;
    this.draw_cherry = false;
    this.draw_strawberry = false;
  }

  //Changes the flavors of the cake
  set_colors(color = "w") {
    if (color == "r"){
      this.layer_color = hex_color("#9c0000")
    } else if (color == "c"){
      this.layer_color = hex_color("#352728")
    }else{
      this.layer_color = hex_color("#faf3eb")
    }
    
  }

  make_control_panel() {
    this.key_triggered_button("Red Velvet", ["r"], () =>
      this.set_colors("r"),
    );
    this.key_triggered_button("Chocolate", ["c"], () =>
      this.set_colors("c"),
    );
    this.key_triggered_button("Vanilla", ["v"], () =>
      this.set_colors("w"),
    );
    this.key_triggered_button("Increase Cake Layers", ["i"], () =>
      this.change_layer_count(1),
    );
    this.key_triggered_button("Decrease Cake Layers", ["d"], () =>
      this.change_layer_count(-1),
    );
    this.key_triggered_button("Cherry", ["p"], () => this.place_cherry());
    this.key_triggered_button("Strawberry", ["s"], () =>
      this.place_strawberry(),
    );
    this.key_triggered_button("Outline", ["o"], () => {
      // Toggle outline
    });
    this.key_triggered_button("Sit still", ["m"], () => {
      // Toggle swaying motion
    });
  }

  change_layer_count(change) {
      this.layer_count = Math.max(1, this.layer_count + change);
  }

  place_cherry() {
    this.draw_cherry = true;
    this.draw_strawberry = false;
  }

  place_strawberry() {
    this.draw_cherry = false;
    this.draw_strawberry = true;
  }

  draw_oven(context, program_state, model_transform) {
    let oven_transform = model_transform
      .times(Mat4.translation(-5, 9, 6))
      .times(Mat4.scale(10, 7, 9));

    this.elements.shapes.oven.draw(
      context,
      program_state,
      oven_transform,
      this.elements.materials.oven,
    );
  }

  draw_ovenrack(context, program_state, model_transform) {
    const num_bars = 9;
    const bar_spacing = 7;
    for (let i = 0; i < num_bars; i++) {
      let rack_transform = model_transform
        .times(Mat4.translation(2 * i + bar_spacing, 1, 1))
        .times(Mat4.scale(0.2, 0.2, 11));

      this.elements.shapes.ovenrack.draw(
        context,
        program_state,
        rack_transform,
        this.elements.materials.ovenrack,
      );
    }
  }

  draw_coal(context, program_state, model_transform) {
    const coal_rows = 11;
    const coal_cols = 19;
    const t = program_state.animation_time / 1000;
    var colorVal = (1 + Math.sin(((2 * Math.PI) / 10) * t)) / 2;
    var coalColor = color(1, colorVal - 0.4, 0, Math.max(colorVal, 0.7));
    for (let i = 0; i < coal_rows; i++) {
      for (let j = 0; j < coal_cols; j++) {
        let coal_transform = model_transform
          .times(Mat4.translation(j - coal_cols / 2, -0.5, i - coal_rows / 2))
          .times(Mat4.scale(0.7, 0.7, 0.7));
        this.elements.shapes.coal.draw(
          context,
          program_state,
          coal_transform,
          this.elements.materials.coal.override({ color: coalColor }),
        );
      }
    }
  }

  draw_cake(context, program_state, model_transform) {
    for (let i = 0; i < this.layer_count; i++) {
      let cake_transform = model_transform
        .times(Mat4.translation(-5, 6 + i, 4))
        .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)) // Rotate to make flat
        .times(Mat4.scale(5 - i, 5 + -i, 2));

      this.elements.shapes.cake.draw(
        context,
        program_state,
        cake_transform,
        this.elements.materials.cake.override({ color: this.layer_color }),
      );
      model_transform = model_transform.times(
        Mat4.translation(0, this.layer_height, 0),
      );
    }

    // This will record the start time of the baking for the cake
    if (this.elements.baking_start_time === null) {
      this.elements.baking_start_time = program_state.animation_time;
    }
  }

  // draw_cake(context, program_state, model_transform) {
  //   for (let i = 0; i < this.layer_count; i++) {
  //     this.elements.shapes.cake.draw(
  //         context,
  //         program_state,
  //         model_transform,
  //         this.elements.materials.cake.override({ color: this.layer_color }),
  //     );
  //     model_transform = model_transform.times(
  //         Mat4.translation(0, this.layer_height, 0),
  //     );
  //   }
  // }

  draw_toppings(context, program_state, model_transform) {
    if (this.draw_cherry) {
      const cherry_transform = model_transform
        .times(
          Mat4.translation(-5, this.layer_height * this.layer_count + 6.5, 4),
        )
        .times(Mat4.scale(0.5, 0.5, 0.5));
      this.elements.shapes.cherry.draw(
        context,
        program_state,
        cherry_transform,
        this.elements.materials.cherry,
      );
    }

    if (this.draw_strawberry) {
      const strawberry_transform = model_transform
        .times(
          Mat4.translation(-5, this.layer_height * this.layer_count + 6.5, 4),
        )
        .times(Mat4.rotation(-(Math.PI / 2), 1, 0, 0))
        .times(Mat4.scale(0.5, 0.5, 0.5));
      this.elements.shapes.strawberry.draw(
        context,
        program_state,
        strawberry_transform,
        this.elements.materials.strawberry,
      );
    }
  }

  remove_coals(model_transform) {
    const new_model_transform = model_transform.times(Mat4.translation(0, -1000, 0));
    return new_model_transform;
  }

  draw_plate(context, program_state, model_transform) {
    let plate_transform = model_transform.times(Mat4.translation(0, 2, 0)).times(Mat4.scale(5, 0.2, 5));

    this.elements.shapes.plate.draw(context, program_state, plate_transform, this.elements.materials.plate);
  }

  display(context, program_state) {
    super.display(context, program_state);
    let model_transform = Mat4.identity();

    this.draw_toppings(context, program_state, model_transform);

    this.draw_cake(context, program_state, model_transform);

    //Time for baking is set to 5 seconds
    if (this.elements.baking_start_time !== null) {
        const total_time = (program_state.animation_time - this.elements.baking_start_time) / 1000;
        if (total_time > 5) {
          this.elements.baking_done = true;

          //this.layer_count = 1;
        }
    }

    if (this.elements.baking_done) {
      model_transform = this.remove_coals(model_transform);
      program_state.set_camera(Mat4.look_at(vec3(-5, 15, 18), vec3(-5, 6, 4), vec3(0, 1, 0)));

      //this.layer_count = 1;
      //Draws the plate
      this.draw_plate(context, program_state, Mat4.identity().times(Mat4.translation(0, 2, 0)).times(Mat4.scale(5, 0.2, 5)));
    }

    if (!this.elements.baking_done) {
      this.draw_oven(context, program_state, model_transform);
      this.draw_coal(context, program_state, model_transform.times(Mat4.translation(-4.5, 15, 5)));
      this.draw_coal(context, program_state, model_transform.times(Mat4.translation(-4.5, 4, 5)));
      this.draw_ovenrack(
          context,
          program_state,
          model_transform.times(Mat4.translation(-20, 4, 4)),
      );

    }

  }
}

class Cube extends Shape {
  constructor() {
    super();
    // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
    this.arrays.position = Vector3.cast(
      [-1, -1, -1],
      [1, -1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, -1],
      [-1, 1, -1],
      [1, 1, 1],
      [-1, 1, 1],
      [-1, -1, -1],
      [-1, -1, 1],
      [-1, 1, -1],
      [-1, 1, 1],
      [1, -1, 1],
      [1, -1, -1],
      [1, 1, 1],
      [1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [-1, 1, 1],
      [1, 1, 1],
      [1, -1, -1],
      [-1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
    );
    this.arrays.normal = Vector3.cast(
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
    );
    // Arrange the vertices into a square shape in texture space too:
    this.indices.push(
      0,
      1,
      2,
      1,
      3,
      2,
      4,
      5,
      6,
      5,
      7,
      6,
      8,
      9,
      10,
      9,
      11,
      10,
      12,
      13,
      14,
      13,
      15,
      14,
      20,
      21,
      22,
      21,
      23,
      22,
    );
  }
}
