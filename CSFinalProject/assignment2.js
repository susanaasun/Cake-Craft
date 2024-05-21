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

      ovenrack: new Cube(),
      cherry: new defs.Subdivision_Sphere(4),
      strawberry: new defs.Rounded_Closed_Cone(3),
      cake: new defs.Capped_Cylinder(20),
      candle: new defs.Capped_Cylinder(20),
      candleflame: new Cube_Triangle_Strip(),
    };

    this.materials = {
      coal: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 1,
        specularity: 0,
        color: hex_color("#FFB852"),
      }),

      oven: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.2,
        color: hex_color("#5E5E5E"),
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
    };

    //Cake Parameters
    this.layer_height = 1;
    this.layer_width = 3;
    this.layer_depth = 3;
    this.layer_color = hex_color("#faf3eb");
    this.layer_count = 5;

    //Toppings
    this.draw_cherry = false;
    this.draw_strawberry = false;

    //Baking
    this.total_baking = 0;
  }
}

class Base_Scene extends Scene {
  /**
   *  **Base_scene** is a Scene that can be added to any display canvas.
   *  Setup the shapes, materials, camera, and lighting here.
   */
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();
    this.hover = this.swarm = false;
    // At the beginning of our program, load one of each of these shape definitions onto the GPU.

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
    // display():  Called once per frame of animation. Here, the base class's display only does
    // some initial setup.

    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls()),
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(Mat4.translation(5, -10, -30));
    }
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100,
    );

    // *** Lights: *** Values of vector or point lights.
    const light_position = vec4(0, 5, 5, 1);
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

    super.display(context, program_state);
    let model_transform = Mat4.identity();

    const coal_rows = 5;
    const coal_cols = 6;

    for (let i = 0; i < coal_rows; i++) {
      for (let j = 0; j < coal_cols; j++) {
        let coal_transform = model_transform.times(Mat4.translation(j, i, 0));

        this.elements.shapes.coal.draw(
          context,
          program_state,
          coal_transform,
          this.elements.materials.coal,
        );
      }
    }
  }
}

export class Assignment2 extends Base_Scene {
  /**
   * This Scene object can be added to any display canvas.
   * We isolate that code so it can be experimented with on its own.
   * This gives you a very small code sandbox for editing a simple scene, and for
   * experimenting with matrix transformations.
   */
  set_colors() {
    // TODO:  Create a class member variable to store your cube's colors.
    // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
    // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
  }

  make_control_panel() {
    // Changes the color of the cake
    this.key_triggered_button("Change Cake Color", ["c"], this.change_color());

    //Increase the layers of the cake by 1
    this.key_triggered_button("Increase Cake Layers", ["i"], () =>
      this.change_layer_count(1),
    );

    //Decrease the layers of the cake by 1
    this.key_triggered_button("Decrease Cake Layer", ["d"], () =>
      this.change_layer_count(-1),
    );

    //Add the topings here
    this.key_triggered_button("Cherry", ["p"], () => this.place_cherry());

    // Add a button for controlling the scene.
    this.key_triggered_button("Outline", ["o"], () => {
      // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
    });
    this.key_triggered_button("Sit still", ["m"], () => {
      // TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.
    });
  }

  change_color() {
    //this.layer
  }

  place_cherry() {
    this.draw_cherry = true;
  }

  place_strawberry() {
    this.draw_strawberry = true;
  }

  draw_cake(context, program_state, model_transform, color, index) {
    let Tr = Mat4.translation(0, index, 0);
    model_transform = model_transform.times(Tr);
    this.shapes.cake.draw(
      context,
      program_state,
      model_transform,
      this.materials.cake,
    );

    return model_transform;
  }

  draw_toppings(context, program_state) {
    let model_transform = Mat4.identity();
    let topping_shape, topping_material;

    if (this.draw_cherry) {
      topping_shape = this.shapes.cherry;
      topping_material = this.materials.cherry;

      for (let i = 0; i < layer_count; i++) {
        topping_shape.draw(
          context,
          program_state,
          model_transform.times(
            Mat4.translation(0, (i + 0.5) * this.layer_height, 0),
          ),
          topping_material,
        );
      }
    } else if (this.draw_strawberry) {
      topping_shape = this.shapes.strawberry;
      topping_material = this.materials.strawberry;
    }
  }
}
