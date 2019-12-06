/* exported app, utils */

const utils = {
  round: (v, n) => Math.round(v * Math.pow(10, n)) / Math.pow(10, n),
  cookies: {
    /**
     * Save a value in a cookie
     * @param {string} name
     * @param {string} value
     * @param {number | undefined} days
     */
    set: function (name, value, days = undefined) {
      const maxAge = !days ? undefined : days * 864e2;
      document.cookie = `${name}=${encodeURIComponent(value)}${maxAge ? `;max-age=${maxAge};` : ''}`;
    },
    /**
     * Get a value from a cookie
     * @param {string} name
     * @return {string} value from cookie or empty if not found
     */
    get: function (name) {
      return document.cookie.split('; ').reduce(function (r, v) {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
      }, '');
    },
    /**
     * Delete a cookie
     * @param {string} name
     */
    delete: function (name) {
      this.set(name, '', -1);
    },
    /**
     * Clear all cookies
     */
    clear: function () {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
  }
};

const data = {
  papers: [
    {title: 'A0', w: 84.1, h: 118.9},
    {title: 'A1', w: 59.4, h: 84.1},
    {title: 'A2', w: 42, h: 59.4},
    {title: 'A3', w: 29.7, h: 42},
    {title: 'A4', w: 21, h: 29.7},
    {title: 'A5', w: 14.8, h: 21},
    {title: 'A6', w: 10.5, h: 14.8},
    {title: 'Double-Raisin', w: 65, h: 100},
    {title: 'Raisin', w: 50, h: 65},
    {title: 'Demi-Raisin', w: 32.5, h: 50},
  ]
};


let app = {
  el: '#app',
  data: {
    //inputs
    sw: 21, sh: 29.7, //sheet size
    m: undefined, n: undefined, //boxes
    bw: undefined, bh: undefined, //box size
    rw: undefined, rh: undefined, //box ratio
    mh: undefined, mv: undefined, //margin
    ph: undefined, pv: undefined, //padding
    sheet: 5,
    ratio: false,
    padding: false,
    incomplete: false,
    finishedH: false, finishedV: false, //finished h
    fbw: false, fbh: false, //forced width or height
    sheets: [
      {title: 'Custom'}
    ]
  },
  watch: {
    sheet: function (v) {
      if (v > 0) {
        this.sw = this.sheets[v].w;
        this.sh = this.sheets[v].h;
      }
      this.refreshValues();
    },
    padding: function (v) {
      if (!v && this.bw && this.mh)
        this.mh = undefined;
      if (!v && this.bh && this.mv)
        this.mv = undefined;
      this.refreshValues();
    },
    ratio: 'refreshValues',
    sw: 'refreshValues',
    sh: 'refreshValues',
    m: 'refreshValues',
    n: 'refreshValues',
    bw: 'refreshValues',
    bh: 'refreshValues',
    rw: 'refreshValues',
    rh: 'refreshValues',
    mh: 'refreshValues',
    mv: 'refreshValues',
    ph: 'refreshValues',
    pv: 'refreshValues',
  },
  methods: {
    refreshValues: function () {
      const self = this;
      this.finishedH = false;
      this.finishedV = false;
      this.incomplete = false;
      this.fbw = false;
      this.fbh = false;
      if (!this.sw || !this.sh || !this.m || !this.n) {
        this.incomplete = true;
      } else {
        if (this.ratio && this.rw && this.rh) {
          if (this.bh && !this.fbw) {
            this.fbw = true;
            this.bw = utils.round(this.bh * this.rw / this.rh, 2);
          }
          if (this.bw && !this.fbh) {
            this.fbh = true;
            this.bh = utils.round(this.bw * this.rh / this.rw, 2);
          }
        }
        if (this.padding) {
          const uh = !this.bw + !this.mh + !this.ph;
          if (uh <= 1) {
            this.finishedH = true;
            if (!this.bw) setTimeout(() => {
              self.finalValue('bw', (this.sw - this.ph * 2 - this.mh * (this.m - 1)) / this.m);
            });
            else if (!this.mh) setTimeout(() => {
              self.finalValue('mh', (this.sw - this.ph * 2 - this.bw * this.m) / (this.m - 1));
            });
            else if (!this.ph) setTimeout(() => {
              self.finalValue('ph', (this.sw - this.mh * (this.m - 1) - this.bw * this.m) / 2);
            });
          }
          const uv = !this.bh + !this.mv + !this.pv;
          if (uv <= 1) {
            this.finishedV = true;
            if (!this.bh) setTimeout(() => {
              self.finalValue('bh', (this.sh - this.pv * 2 - this.mv * (this.n - 1)) / this.n);
            });
            else if (!this.mv) setTimeout(() => {
              self.finalValue('mv', (this.sw - this.pv * 2 - this.bh * this.n) / (this.n - 1));
            });
            else if (!this.pv) setTimeout(() => {
              self.finalValue('pv', (this.sw - this.mv * (this.m - 1) - this.bh * this.n) / 2);
            });
          }
        } else {
          const uh = !this.bw + !this.mh;
          if (uh <= 1) {
            this.finishedH = true;
            if (!this.bw) setTimeout(() => {
              self.finalValue('bw', (this.sw - this.mh * (this.m + 1)) / this.m);
            });
            else if (!this.mh) setTimeout(() => {
              self.finalValue('mh', (this.sw - this.bw * this.m) / (this.m + 1));
            });
          }
          const uv = !this.bh + !this.mv;
          if (uv <= 1) {
            this.finishedV = true;
            if (!this.bh) setTimeout(() => {
              self.finalValue('bh', (this.sh - this.mv * (this.n + 1)) / this.n);
            });
            else if (!this.mv) setTimeout(() => {
              self.finalValue('mv', (this.sw - this.bh * this.n) / (this.n + 1));
            });
          }
        }
      }
      this.redraw();
    },
    finalValue: function (n, v) {
      v = utils.round(v, 2);
      console.log(n, v);
      document.getElementById(n).value = v;
    },
    'reset': function () {
      const self = this;
      ['bw', 'bh', 'rw', 'rh', 'mh', 'mv', 'ph', 'pv'].forEach(name => {
        Vue.set(self, name, undefined);
      });
    },
    redraw: function () {
      if (this.sw && this.sh) {
        const maxWidth = 0.8 * this.$el.getBoundingClientRect().width;
        let height = this.previewMaxHeight;
        let width = height * this.sw / this.sh;
        if (width > maxWidth) {
          width = maxWidth;
          height = width * this.sh / this.sw;
        }
        this.preview.setAttribute('width', width);
        this.preview.style.width = `${width}px`;
        this.preview.setAttribute('height', height);
        this.preview.style.height = `${height}px`;

        const ctx = this.preview.getContext('2d');
        ctx.clearRect(0,0, width, height);

        ctx.lineWidth = 4;
        ctx.strokeStyle = '#424242';
        ctx.strokeRect(0, 0, width, height);
      } else {
        this.preview.width = 1;
        this.preview.height = 1;
      }
    }
  },
  'mounted': function () {
    const self = this;
    this.preview = document.getElementById('preview');
    data.papers.forEach(s => {
      self.sheets.push({
        title: `${s.title} (${s.w}×${s.h}cm)`,
        w: s.w, h: s.h
      });
    });
    data.papers.forEach(s => {
      self.sheets.push({
        title: `${s.title} landscape (${s.h}×${s.w}cm)`,
        w: s.h, h: s.w
      });
    });
    console.log('app mounted');
    setTimeout(() => {
      self.$el.setAttribute('style', '');
      self.previewMaxHeight = this.preview.getBoundingClientRect().height;
      self.refreshValues();
    });
  }
};

window.onload = () => {
  app = new Vue(app);
};