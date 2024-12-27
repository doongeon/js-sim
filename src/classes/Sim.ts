import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../main";

interface SimProps {
    position: { x: number; y: number };
    mass: number;
    color: string;
    isBlock: Boolean;
}

export class Sim {
    _isBlock: Boolean;
    _position: { x: number; y: number };
    _vector: { dx: number; dy: number };
    _mass: number;
    _color: string;
    _reaction: number;

    constructor({ position, mass, color, isBlock = true }: SimProps) {
        this._isBlock = isBlock;
        this._position = position;
        this._mass = mass;
        this._color = color;
        this._vector = { dx: 0, dy: 0 };
        this._reaction = 0.7;
    }

    set position(position: { x: number; y: number }) {
        this._position = position;
    }

    get position() {
        return this._position;
    }

    set x(x: number) {
        this._position.x = Math.max(0, Math.min(x, CANVAS_WIDTH));
    }

    get x() {
        return this._position.x;
    }

    set y(y: number) {
        this._position.y = Math.max(0, Math.min(y, CANVAS_HEIGHT));
    }

    get y() {
        return this._position.y;
    }

    get dy() {
        return this._vector.dy;
    }

    get dx() {
        return this._vector.dx;
    }

    set color(color: string) {
        this._color = color;
    }

    get color() {
        return this._color;
    }

    updatePosition() {
        this._vector.dy += 0.5; // 중력
        this._vector.dx *= 0.99; // 저항
        this.x += this.dx;
        this.y += this.dy;
        this._detectCanvasCollision();
    }

    _detectCanvasCollision() {
        // Detect collision on left or right
        if (this._position.x <= 0 || this._position.x >= CANVAS_WIDTH) {
            this._vector.dx *= -this._reaction;
        }

        // Detect collision on top or bottom
        if (this._position.y <= 0 || this._position.y >= CANVAS_HEIGHT) {
            this._vector.dy *= -this._reaction;
        }
    }
}

interface CircleProps extends SimProps {
    radius: number;
}

export class Circle extends Sim {
    _radius: number;

    constructor(prop: CircleProps) {
        super(prop);
        this._radius = prop.radius;
    }

    set radius(r: number) {
        if (r < 0) return;
        this._radius = r;
    }

    get radius() {
        return this._radius;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 360);
        ctx.fill();
    }

    detectObjectCollision(other: Sim) {
        if (other instanceof Circle) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const combinedRadius = this.radius + other.radius;

            if (distance < combinedRadius) {
                // 충돌 처리
                const normalX = dx / distance;
                const normalY = dy / distance;

                const relativeVelocityX = this._vector.dx - other._vector.dx;
                const relativeVelocityY = this._vector.dy - other._vector.dy;

                const dotProduct =
                    relativeVelocityX * normalX + relativeVelocityY * normalY;

                if (dotProduct > 0) return;

                const impulse = (2 * dotProduct) / (this._mass + other._mass);

                this._vector.dx -= impulse * other._mass * normalX;
                this._vector.dy -= impulse * other._mass * normalY;

                other._vector.dx += impulse * this._mass * normalX;
                other._vector.dy += impulse * this._mass * normalY;
            }
        }
    }
}
