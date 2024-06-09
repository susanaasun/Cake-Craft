// spatial partioning for collision detection

export class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(topping) {
        return (
            topping.x >= this.x - this.w &&
            topping.x <= this.x + this.w &&
            topping.z >= this.y - this.h &&
            topping.z <= this.y + this.h
        );
    }

    intersects(range) {
        return !(
            range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.z - range.h > this.y + this.h ||
            range.z + range.h < this.y - this.h
        );
    }
}

export class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.toppings = [];
        this.divided = false;
    }

    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w/2;
        let h = this.boundary.h/2;

        let ne = new Rectangle(x+w, y-h, w, h);
        this.northeast = new QuadTree(ne, this.capacity);
        let nw = new Rectangle(x-w, y-h, w, h);
        this.northwest = new QuadTree(nw, this.capacity);
        let se = new Rectangle(x + w, y + h, w, h);
        this.southeast = new QuadTree(se, this.capacity);
        let sw = new Rectangle(x - w, y + h, w, h);
        this.southwest = new QuadTree(sw, this.capacity);

        this.divided = true;
    }

    insert(topping) {
        if (!this.boundary.contains(topping)) {
            return false;
        }

        if (this.toppings.length < this.capacity) {
            this.toppings.push(topping);
            return true;
        } else {
            if (!this.divided) {
                this.subdivide();
            }

            if (this.northeast.insert(topping)) {
                return true;
            } else if (this.northwest.insert(topping)) {
                return true;
            } else if (this.southeast.insert(topping)) {
                return true;
            } else if (this.southwest.insert(topping)) {
                return true;
            }
        }
    }

    query(range, found) {
        if (!found) {
            found = []
        }

        if (!this.boundary.intersects(range)) {
            return found;
        } else {
            for (let topping of this.toppings) {
                if (range.contains(topping)) {
                    found.push(topping);
                }
            }
            if (this.divided) {
                this.northwest.query(range, found);
                this.northeast.query(range, found);
                this.southwest.query(range, found);
                this.southeast.query(range, found);
            }
        }
        return found;
    }
}