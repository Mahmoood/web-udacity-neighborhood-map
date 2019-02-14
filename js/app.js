const initialCats = [
    {
        clickCount: 0,
        name: "Tabby",
        imgSrc: "img/434164568_fea0ad4013_z.jpg",
        imgAttribution: '',
        nickNames: ['Tab-Tab', 'T-Bone', 'Mr. T']
    },
    {
        clickCount: 0,
        name: "Tiger",
        imgSrc: "img/4154543904_6e2428c421_z.jpg",
        imgAttribution: '',
        nickNames: ['Tigger']
    },
    {
        clickCount: 0,
        name: "Scaredy",
        imgSrc: "img/22252709_010df3379e_z.jpg",
        imgAttribution: '',
        nickNames: ['Casper', 'Cassy', 'Mr. C']
    },
    {
        clickCount: 0,
        name: "Shadow",
        imgSrc: "img/1413379559_412a540d29_z.jpg",
        imgAttribution: '',
        nickNames: ['Shooby', 'T-Bone', 'Mr. Sh']
    },
    {
        clickCount: 0,
        name: "Sleepy",
        imgSrc: "img/9648464288_2516b35537_z.jpg",
        imgAttribution: '',
        nickNames: ['ZZZZ']
    }
];

var Cat = function(data) {
    "use strict";
    this.clickCount = ko.observable(data.clickCount);
    this.name = ko.observable(data.name);
    this.imgSrc = ko.observable(data.imgSrc);
    this.imgAttribution = ko.observable(data.imgAttribution);
    this.nickNames = ko.observableArray(data.nickNames);
    this.catLevel = ko.computed( function() {
        let title, numClicks;
        numClicks = this.clickCount();
        if (numClicks < 10) { title = 'NewBorn'; }
        else if (numClicks < 15) { title = 'Infant'; }
        else if (numClicks < 20) { title = 'Child'; }
        else if (numClicks < 25) { title = 'Adult'; }
        else { title = 'Ninja'; }
        return title;
    }, this);
}
var ViewModel = function () {
    "use strict";
    let self = this;
    this.catList = ko.observableArray([]);
    initialCats.forEach(function(catObj) {
        self.catList.push(new Cat(catObj));
    });
    this.currentCat = ko.observable( this.catList()[0] );
    this.incrementCounter = function () {
        // this.clickCount( this.clickCount() + 1 );
        self.currentCat().clickCount(self.currentCat().clickCount() + 1);
    };
    this.setCat = function ( selectedCat ) {
        // console.log(selectedCat);
        self.currentCat(selectedCat);
    };
};

ko.applyBindings(new ViewModel());