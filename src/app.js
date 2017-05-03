(function () {
  'use strict';
  //to prevent mistakes like defining variables on global scope, eg. x=20 without using var

  angular.module("ShoppingListApp", [])
  .controller("ShoppingListOneController", ShoppingListOneController)
  .controller("ShoppingListTwoController", ShoppingListTwoController)
  .factory("ShoppingListFactory", ShoppingListFactory)
  .service("HealthyFoodService", HealthyFoodService)
  .directive("shoppingList", ShoppingListDirective)
  .controller("ShoppingListDirectiveController", ShoppingListDirectiveController);

  function ShoppingListDirective() {
    var ddo = {
      restrict: 'E',
      templateUrl: 'src/shoppinglist/shoppingList.html',
      scope: {
        list: '=myList', // can use '<'
        title: '@title'
      },
      controller: 'ShoppingListDirectiveController as list',
      bindToController: true
    };

    return ddo;
  }

  function ShoppingListDirectiveController() {
    var list = this;


  }

  ShoppingListOneController.$inject = ['ShoppingListFactory'];
  function ShoppingListOneController(ShoppingListFactory){
    var list1 = this;

    //Use factory to create new shopping list
    var shoppingList = ShoppingListFactory();

    list1.items = shoppingList.getItems();

    list1.item = { itemName: '', itemQuantity: null };

    list1.addItem = function() {
      shoppingList.addItem(list1.item);
    };

    list1.removeItem = function(index) {
      shoppingList.removeItem(index);
    };
  }

  ShoppingListTwoController.$inject = ['ShoppingListFactory'];
  function ShoppingListTwoController(ShoppingListFactory) {
    var list2 = this;

    // Create a new shopping list
    list2.maxItems = 5;
    var shoppingList = ShoppingListFactory(list2.maxItems);

    list2.items = shoppingList.getItems();

    list2.item = { itemName: '', itemQuantity: null };

    list2.addItem = function(){
      shoppingList.addItem(list2.item)
      .then(function(success){
        console.log(success);
      })
      .catch(function(error){
        console.log(error);
      });
    };

    list2.removeItem = function(index){
      shoppingList.removeItem(index);
    };

  }

  HealthyFoodService.$inject = ['$q', '$timeout'];
  function HealthyFoodService($q, $timeout) {
    var service = this;

    service.checkName = function (name) {
      var deferred = $q.defer();

      var result = {
        message: "1"
      };

      $timeout(function () {
        // Check for maggi
        if (name.toLowerCase().indexOf('maggi') === -1) {
          deferred.resolve(result)
        }
        else {
          result.message = "Stay away from maggi, Ayush!";
          deferred.reject(result);
        }
      }, 3000);

      return deferred.promise;
    };

    service.checkQuantity = function (quantity) {
      var deferred = $q.defer();
      var result = {
        message: "2"
      };

      $timeout(function () {
        // Check for too many boxes
        if (quantity < 6) {
          deferred.resolve(result);
        }
        else {
          result.message = "That's too much, Ayush!";
          deferred.reject(result);
        }
      }, 1000);

      return deferred.promise;
    };
  }

  function ShoppingListService(maxItems, $q, HealthyFoodService) {
    var service = this;

    //Items Array
    var items = [];

    service.addItem = function(item) {
      var deferred = $q.defer();

      var namePromise = HealthyFoodService.checkName(item.itemName);
      var quantityPromise = HealthyFoodService.checkQuantity(item.itemQuantity);

      //Handling Promises simultaneously, Time to fail = Faster max 3 secs(since they run parallelly)
      $q.all([namePromise, quantityPromise])
      .then(function (response) {
        if((maxItems === undefined) || (maxItems !== undefined) &&(items.length < maxItems)){
          var itemObj = {
            name: item.itemName,
            quantity: item.itemQuantity
          };
          items.push(itemObj);

          deferred.resolve('Success');
        }
        else {
          throw new Error('Max Items Reached!!');
        }
      })
      .catch(function(err) {
        console.log(err);
        items['error'] = err['message'];

        deferred.reject('Something\'s Not Right');
      });

      return deferred.promise;
    };

    service.removeItem = function(index) {
      items.splice(index, 1);
    };

    service.catchError = function() {
      return error;
    };

    service.getItems = function() {
      return items;
    };
  }

  ShoppingListFactory.$inject = ['$q', 'HealthyFoodService'];
  function ShoppingListFactory($q, HealthyFoodService) {
    var factory = function(maxItems){
      return new ShoppingListService(maxItems, $q, HealthyFoodService);
    };

    return factory;
  }

})();
