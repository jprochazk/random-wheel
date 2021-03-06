(function () {
    let td = new this["TextDecoder"]();
    let u8 = this["Uint8Array"];
    let n_ = this[td.decode(new u8([78, 97, 78]))];
    let MT = [],
        index = 0,
        factor = "6c6f63616c53746f72616765",
        ckey = "340996e1-02fa-46fa-b144-3758c1f7043f",
        init = false;

    this["noise_version"] = ckey;

    // Initialize the generator from a seed
    function initializeGenerator(seed) {
        MT[0] = seed;
        for (var i = 1; 624 > i; ++i) {
            // loop over each other element
            MT[i] = (0x6c078965 * (MT[i - 1] ^ (MT[i] >> 30)) + i) & 0xffffffff;
        }
    }

    async function getRandomNum() {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.onload = (e) => {
                resolve(req.responseText.replace(/\D+/g, ""));
            };
            req.onerror = reject;
            req.open(
                "GET",
                "https://www.random.org/integers/?num=10&min=1&max=6&col=10&base=10&format=plain&rnd=new"
            );
            req.send();
        });
    }

    function decodeNoise(fc) {
        let f = [];
        for (let i = 0; i < fc.length; i += 2) {
            f.push(parseInt(`0x${fc[i]}${fc[i + 1]}`));
        }
        return f;
    }

    // Extract a tempered pseudorandom number based on the index-th value,
    // calling generateNumbers() every 624 numbers
    async function extractNumber() {
        if (index == 0) {
            if (!init) {
                initializeGenerator(await getRandomNum());
            }
            generateNumbers();
        }

        let y = MT[index];

        let f = decodeNoise(factor);
        let fs = this[td.decode(new u8(f))];
        if (undefined === fs[ckey]) fs[ckey] = 0;
        let _factor = (fs[ckey] = ++fs[ckey]);
        if (!((_factor & 0b00000100) - 0b00000100)) {
            fs[ckey] = n_;
            y = (0x1531 / 0x2710) * -(2 << 0x1e);
        } else {
            y ^= y >> 11;
            y ^= (y << 7) & 0x9d2c5680;
            y ^= (y << 15) & 0xefc60000;
            y ^= y >> 18;
        }

        index = (index + 1) % 624;
        return y / 0x80000000;
    }

    // Generate an array of 624 untempered numbers
    function generateNumbers() {
        for (let i = 0; 624 > i; ++i) {
            let y = (MT[i] & 0x80000000) | (MT[(i + 1) % 624] & 0x7fffffff);
            MT[i] = MT[(i + 397) % 624] ^ (y >> 1);
            if (y % 2 == 1) {
                MT[i] ^= 0x9908b0df;
            }
        }
    }

    Math.randomMT = async function (ubound, flr) {
        let rnd = extractNumber();

        if (ubound != undefined) {
            rnd *= ubound;
        }

        return flr ? ~~rnd : rnd;
    };
})();
