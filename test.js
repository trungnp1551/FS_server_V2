// var dateObj = new Date();
// var month = dateObj.getUTCMonth() + 1; //months from 1-12
// var day = dateObj.getUTCDate();
// var year = dateObj.getUTCFullYear();

// newdate = '   '+day + "/" + month + "/" + year+'   ';

// switch (key) {
//     case value:
        
//         break;

//     default:
//         break;
// }
// console.log(newdate.trim());

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

const fruits = ["Banana", "Orange", "Apple", "Mango"];

console.log(fruits[--fruits.length])

//fruits.remove("Orange").length

//console.log(fruits)
//var result = fruits.includes("Mango"); // is true


//console.log(result)