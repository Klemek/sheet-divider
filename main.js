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
    focused: undefined,
    //inputs
    sw: 21, sh: 29.7, //sheet size
    m: 1, n: 1, //boxes //TODO undefined
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
    setFocus: function (name) {
      this.focused = name;
      this.redraw();
    },
    refreshValues: function () {
      const self = this;
      this.finishedH = false;
      this.finishedV = false;
      this.incomplete = false;
      this.fbw = false;
      this.fbh = false;
      ['sw', 'sh', 'm', 'n', 'bw', 'bh', 'rw', 'rh', 'mh', 'mv', 'ph', 'pv'].forEach(name => {
        if (self[name]) {
          Vue.set(self, name, parseFloat(self[name]));
        }
      });
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
              self.setFinalValue('bw', (this.sw - this.ph * 2 - this.mh * (this.m - 1)) / this.m);
            });
            else if (!this.mh) setTimeout(() => {
              self.setFinalValue('mh', (this.sw - this.ph * 2 - this.bw * this.m) / (this.m - 1));
            });
            else if (!this.ph) setTimeout(() => {
              self.setFinalValue('ph', (this.sw - this.mh * (this.m - 1) - this.bw * this.m) / 2);
            });
          }
          const uv = !this.bh + !this.mv + !this.pv;
          if (uv <= 1) {
            this.finishedV = true;
            if (!this.bh) setTimeout(() => {
              self.setFinalValue('bh', (this.sh - this.pv * 2 - this.mv * (this.n - 1)) / this.n);
            });
            else if (!this.mv) setTimeout(() => {
              self.setFinalValue('mv', (this.sh - this.pv * 2 - this.bh * this.n) / (this.n - 1));
            });
            else if (!this.pv) setTimeout(() => {
              self.setFinalValue('pv', (this.sh - this.mv * (this.m - 1) - this.bh * this.n) / 2);
            });
          }
        } else {
          const uh = !this.bw + !this.mh;
          if (uh <= 1) {
            this.finishedH = true;
            if (!this.bw) setTimeout(() => {
              self.setFinalValue('bw', (this.sw - this.mh * (this.m + 1)) / this.m);
            });
            else if (!this.mh) setTimeout(() => {
              self.setFinalValue('mh', (this.sw - this.bw * this.m) / (this.m + 1));
            });
          }
          const uv = !this.bh + !this.mv;
          if (uv <= 1) {
            this.finishedV = true;
            if (!this.bh) setTimeout(() => {
              self.setFinalValue('bh', (this.sh - this.mv * (this.n + 1)) / this.n);
            });
            else if (!this.mv) setTimeout(() => {
              self.setFinalValue('mv', (this.sh - this.bh * this.n) / (this.n + 1));
            });
          }
        }
      }
      setTimeout(this.redraw);
    },
    setFinalValue: function (n, v) {
      v = utils.round(v, 2);
      document.getElementById(n).value = v;
    },
    getFinalValue: function (n) {
      return parseFloat(document.getElementById(n).value);
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
        ctx.clearRect(0, 0, width, height);

        ctx.lineWidth = 4;
        ctx.strokeStyle = (this.focused === 'sw' || this.focused === 'sheet') ? '#c62828' : '#424242';
        ctx.beginPath();
        ctx.moveTo(1, 1);
        ctx.lineTo(width - 2, 1);
        ctx.moveTo(1, height - 2);
        ctx.lineTo(width - 2, height - 2);
        ctx.stroke();

        ctx.strokeStyle = (this.focused === 'sh' || this.focused === 'sheet') ? '#c62828' : '#424242';
        ctx.beginPath();
        ctx.moveTo(1, 1);
        ctx.lineTo(1, height - 2);
        ctx.moveTo(width - 2, 1);
        ctx.lineTo(width - 2, height - 2);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#424242';

        const m = this.m || 1;
        const n = this.n || 1;
        const bw = this.finishedH ? width * (this.bw / this.sw) : width / m;
        const bh = this.finishedV ? height * (this.bh / this.sh) : height / n;
        const mh = this.finishedH ? width * (this.getFinalValue('mh') / this.sw) : 0;
        const mv = this.finishedV ? height * (this.getFinalValue('mv') / this.sh) : 0;
        const ph = this.finishedH ? (this.padding ? width * (this.getFinalValue('ph') / this.sw) : mh) : 0;
        const pv = this.finishedV ? (this.padding ? height * (this.getFinalValue('pv') / this.sh) : mv) : 0;

        for (let x = 0; x < m; x++) {
          for (let y = 0; y < n; y++) {
            ctx.strokeRect(ph + (bw + mh) * x, pv + (bh + mv) * y, bw, bh);
          }
        }
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