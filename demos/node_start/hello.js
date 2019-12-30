let map = new Map([['k1', 'v1'], ['k2', 'v2'], ['k3', 'v3']]);
map.forEach((v, k, m) => {
    console.log(k);
    console.log(v);
});