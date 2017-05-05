(function () {
  'use strict';
  //to prevent mistakes like defining variables on global scope, eg. x=20 without using var

  angular.module("ShoppingListApp", ['Spinner'])
  .controller("QuickAddController", QuickAddController)
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

  QuickAddController.$inject = ['$rootScope'];
  function QuickAddController($rootScope) {
    var quickadd = this;

    // TODO: USE SERVICE
    quickadd.listitems = ['Chips', 'Cookies', 'Eggs', 'Bananas', 'Milk 500ml'];

    quickadd.addToListOne = function(item, qty) {
      $rootScope.$broadcast('quickadd_list1', {
        itemName: item,
        itemQuantity: qty
      })
    };

    quickadd.addToListTwo = function(item, qty) {
      $rootScope.$broadcast('quickadd_list2', {
        itemName: item,
        itemQuantity: qty
      })
    };
  }

  ShoppingListOneController.$inject = ['ShoppingListFactory', '$rootScope'];
  function ShoppingListOneController(ShoppingListFactory, $rootScope){
    var list1 = this;

    //Use factory to create new shopping list
    var shoppingList = ShoppingListFactory();

    list1.items = shoppingList.getItems();

    list1.item = { itemName: '', itemQuantity: null };

    list1.addItem = function(item) {
      console.log(item);
      list1.showSpinner = true;
      shoppingList.addItem(item)
      .then(function(success){
        console.info(success);
        list1.showSpinner = false;
      })
      .catch(function(error){
        console.info(error);
        list1.showSpinner = false;
      });
    };

    list1.removeItem = function(index) {
      shoppingList.removeItem(index);
    };

    $rootScope.$on('quickadd_list1', function(event, item) {
      list1.addItem(item);
    });
  }

  ShoppingListTwoController.$inject = ['ShoppingListFactory', '$rootScope'];
  function ShoppingListTwoController(ShoppingListFactory, $rootScope) {
    var list2 = this;

    // Create a new shopping list
    list2.maxItems = 5;
    var shoppingList = ShoppingListFactory(list2.maxItems);

    list2.items = shoppingList.getItems();

    list2.item = { itemName: '', itemQuantity: null };

    list2.addItem = function(item){
      list2.showSpinner = true;
      shoppingList.addItem(item)
      .then(function(success){
        list2.successResp = success;
        console.info(success);
        list2.showSpinner = false;
      })
      .catch(function(error){
        list2.errorResp = error;
        console.info(error);
        list2.showSpinner = false;
      });
    };

    list2.removeItem = function(index){
      shoppingList.removeItem(index);
    };

    $rootScope.$on('quickadd_list2', function(event, item) {
      list2.addItem(item);
    });
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
