
export const xorshift32 = (n0: number): integer => {
  const x = (e: integer): integer => {
    e ^= (e << 13);
    e >>>= 0;
    e ^= e >> 17;
    e >>>= 0;
    e ^= (e << 5);
    return e >>> 0;
  };
  let n = (n0 * 2) | 1; // 全ゼロ回避
  for (let i = 0; i < 20; ++i) {
    n = x(n);
  }
  return n;
};

export const clamp = (v: number, lo: number, hi: number): number => {
  if (v < lo) { return lo; }
  if (hi < v) { return hi; }
  return v;
}

export class Rng {
  // from  pcg_oneseq_32_xsh_rs_16_random_r at https://github.com/imneme/pcg-c/
  state: integer
  constructor(seed: integer) {
    this.state = Rng.step(seed) | 1;
  }
  static output(n: integer): integer {
    // inline uint16_t pcg_output_xsh_rs_32_16(uint32_t state)
    // {
    //     return (uint16_t)(((state >> 11u) ^ state) >> ((state >> 30u) + 11u));
    // }
    return ((((n >> 11) ^ n) >>> 0) >> ((n >> 30) + 11)) & 0xffff;
  }
  next16(): number {
    // inline uint16_t pcg_oneseq_32_xsh_rs_16_random_r(struct pcg_state_32* rng)
    // {
    //     uint32_t oldstate = rng->state;
    //     pcg_oneseq_32_step_r(rng);
    //     return pcg_output_xsh_rs_32_16(oldstate);
    // }
    const old = this.state;
    this.state = Rng.step(old);
    return Rng.output(old);
  }
  next(): number {
    return ((this.next16() << 16) >>> 0) + this.next16();
  }
  static step(n: number): number {
    // #define PCG_DEFAULT_MULTIPLIER_32  747796405U
    // #define PCG_DEFAULT_INCREMENT_32   2891336453U
    // inline void pcg_oneseq_32_step_r(struct pcg_state_32* rng)
    // {
    //     rng->state = rng->state * PCG_DEFAULT_MULTIPLIER_32
    //                  + PCG_DEFAULT_INCREMENT_32;
    // }
    const mul = 747796405;
    const inc = 2891336453;
    // rng->state = rng->state * PCG_DEFAULT_MULTIPLIER_32 + PCG_DEFAULT_INCREMENT_32;
    return (((n * mul) >>> 0) + inc) >>> 0;
  }
}
