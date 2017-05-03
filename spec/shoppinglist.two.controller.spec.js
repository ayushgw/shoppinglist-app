describe("ShoppingListTwoController", function() {

  beforeEach(module('ShoppingListApp'));

  var $controller;
  var shoppingListTwoController;

  beforeEach(inject(function (_$controller_, $q){
    $controller = _$controller_;
    var deferred = $q.defer();

    var ShoppingListFactoryErrorMock = function() {
      var mockService = {};

      mockService.getItems = function() {
        return null;
      };
      mockService.addItem = function(mockItem) {
        deferred.reject('mock error message');

        return deferred.promise;
      };

      return mockService;
    };

    shoppingListTwoController = $controller('ShoppingListTwoController', {
      ShoppingListFactory: ShoppingListFactoryErrorMock
    });

  }));

  it("should log an error message in the console", function() {
    shoppingListTwoController.addItem();
    expect(shoppingListTwoController.errorTest).toBe("mock error message");
  });

});
