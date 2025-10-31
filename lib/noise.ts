// Simplified Perlin noise implementation for procedural generation
// Based on Ken Perlin's improved noise

class PerlinNoise {
  private permutation: number[];
  private p: number[];

  constructor(seed: number = 0) {
    // Generate permutation table from seed
    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }

    // Shuffle based on seed
    this.shuffle(this.permutation, seed);

    // Duplicate the permutation table
    this.p = [];
    for (let i = 0; i < 512; i++) {
      this.p[i] = this.permutation[i % 256];
    }
  }

  private shuffle(array: number[], seed: number): void {
    let currentIndex = array.length;
    let randomIndex: number;

    // Seeded random using sine
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    while (currentIndex > 0) {
      randomIndex = Math.floor(seededRandom(seed++) * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // 3D Perlin noise
  noise(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(
      w,
      this.lerp(
        v,
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
      ),
      this.lerp(
        v,
        this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))
      )
    );
  }

  // Octave noise for more natural variation
  octaveNoise(x: number, y: number, z: number, octaves: number = 4, persistence: number = 0.5): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

// Global noise instance (will be reinitialized with world seed)
let noiseInstance: PerlinNoise | null = null;

export function initNoise(seed: number): void {
  noiseInstance = new PerlinNoise(seed);
}

export function getNoise(x: number, y: number, z: number = 0): number {
  if (!noiseInstance) {
    initNoise(Date.now());
  }
  return noiseInstance!.noise(x, y, z);
}

export function getOctaveNoise(x: number, y: number, z: number = 0, octaves: number = 4): number {
  if (!noiseInstance) {
    initNoise(Date.now());
  }
  return noiseInstance!.octaveNoise(x, y, z, octaves);
}
