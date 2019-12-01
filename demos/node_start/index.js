var obj1 = {
    x: 1,
    name: function () {
        return 'obj1';
    }
};
var obj2 = {
    y: 2,
    name: function () {
        return 'obj2';
    }
};
var obj3 = {
    z: 3,
    name: function () {
        return 'obj3';
    },
    toString: function () {
        for (var x in this) {
            if (x !== 'name' && x !== 'toString') {
                console.log('Object: ' + this.name() + ', ' + x + ': ' + this[x]);
            }
        }
    }
};
obj1.__proto__ = obj2;
obj2.__proto__ = obj3;
obj1.toString();
obj2.toString();
obj3.toString();
// 输出：
// Object: obj1, x: 1
// Object: obj1, y: 2
// Object: obj1, z: 3
// Object: obj2, y: 2
// Object: obj2, z: 3
// Object: obj3, z: 3
Object.getPrototypeOf(obj1).toString();