/*global defineSuite*/
defineSuite([
         'Widgets/BaseLayerPicker/BaseLayerPickerViewModel',
         'Widgets/BaseLayerPicker/ProviderViewModel',
         'Scene/EllipsoidTerrainProvider',
         'Scene/ImageryLayerCollection'
     ], function(
         BaseLayerPickerViewModel,
         ProviderViewModel,
         EllipsoidTerrainProvider,
         ImageryLayerCollection) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var MockCentralBody = function() {
        this.imageryLayers = new ImageryLayerCollection();
        this.terrainProvider = new EllipsoidTerrainProvider();
    };

    var testProvider = {
        isReady : function() {
            return false;
        }
    };

    var testProvider2 = {
        isReady : function() {
            return false;
        }
    };

    var testProvider3 = {
        isReady : function() {
            return false;
        }
    };

    var testProviderViewModel = new ProviderViewModel({
        name : 'name',
        tooltip : 'tooltip',
        iconUrl : 'url',
        creationFunction : function() {
            return testProvider;
        }
    });

    var testProviderViewModel2 = new ProviderViewModel({
        name : 'name2',
        tooltip : 'tooltip2',
        iconUrl : 'url2',
        creationFunction : function() {
            return [testProvider, testProvider2];
        }
    });

    var testProviderViewModel3 = new ProviderViewModel({
        name : 'name3',
        tooltip : 'tooltip3',
        iconUrl : 'url3',
        creationFunction : function() {
            return testProvider3;
        }
    });

    it('constructor sets expected values', function() {
        var imageryViewModels = [];
        var terrainViewModels = [];

        var centralBody = new MockCentralBody();

        var viewModel = new BaseLayerPickerViewModel(centralBody, imageryViewModels, terrainViewModels);
        expect(viewModel.centralBody).toBe(centralBody);
        expect(viewModel.imageryProviderViewModels).toEqual(imageryViewModels);
        expect(viewModel.terrainProviderViewModels).toEqual(terrainViewModels);
    });

    it('selecting imagery closes the dropDown', function() {
        var array = [testProviderViewModel];
        var centralBody = new MockCentralBody();
        var imageryLayers = centralBody.imageryLayers;
        var viewModel = new BaseLayerPickerViewModel(centralBody, array);

        viewModel.dropDownVisible = true;
        viewModel.selectedImagery = testProviderViewModel;
        expect(viewModel.dropDownVisible).toEqual(false);
    });

    it('selecting terrain closes the dropDown', function() {
        var array = [testProviderViewModel];
        var centralBody = new MockCentralBody();
        var imageryLayers = centralBody.imageryLayers;
        var viewModel = new BaseLayerPickerViewModel(centralBody, array);

        viewModel.dropDownVisible = true;
        viewModel.selectedTerrain = testProviderViewModel;
        expect(viewModel.dropDownVisible).toEqual(false);
    });

    it('tooltip, buttonImageUrl, and selectedImagery all return expected values', function() {
        var imageryViewModels = [testProviderViewModel];
        var terrainViewModels = [testProviderViewModel3];
        var centralBody = new MockCentralBody();
        var imageryLayers = centralBody.imageryLayers;

        var viewModel = new BaseLayerPickerViewModel(centralBody, imageryViewModels, terrainViewModels);

        expect(viewModel.buttonTooltip).toBeUndefined();
        expect(viewModel.buttonImageUrl).toBeUndefined();
        expect(viewModel.selectedImagery).toBeUndefined();
        expect(viewModel.selectedTerrain).toBeUndefined();

        viewModel.selectedImagery = testProviderViewModel;
        expect(viewModel.buttonTooltip).toEqual(testProviderViewModel.name);

        viewModel.selectedImagery = undefined;
        viewModel.selectedTerrain = testProviderViewModel3;
        expect(viewModel.buttonTooltip).toEqual(testProviderViewModel3.name);

        viewModel.selectedImagery = testProviderViewModel;
        expect(viewModel.buttonTooltip).toEqual(testProviderViewModel.name + '\n' + testProviderViewModel3.name);

        expect(viewModel.buttonImageUrl).toEqual(testProviderViewModel.iconUrl);
        expect(viewModel.selectedImagery).toBe(testProviderViewModel);
        expect(viewModel.selectedTerrain).toBe(testProviderViewModel3);
    });

    it('selectedImagery actually sets base layer', function() {
        var array = [testProviderViewModel];
        var centralBody = new MockCentralBody();
        var imageryLayers = centralBody.imageryLayers;
        var viewModel = new BaseLayerPickerViewModel(centralBody, array);

        expect(imageryLayers.length).toEqual(0);

        viewModel.selectedImagery = testProviderViewModel;
        expect(imageryLayers.length).toEqual(1);
        expect(imageryLayers.get(0).imageryProvider).toBe(testProvider);

        viewModel.selectedImagery = testProviderViewModel2;
        expect(imageryLayers.length).toEqual(2);
        expect(imageryLayers.get(0).imageryProvider).toBe(testProvider);
        expect(imageryLayers.get(1).imageryProvider).toBe(testProvider2);
    });

    it('selectedTerrain actually sets terrainPRovider', function() {
        var terrainProviderViewModels = [testProviderViewModel, testProviderViewModel3];
        var centralBody = new MockCentralBody();
        var viewModel = new BaseLayerPickerViewModel(centralBody, [], terrainProviderViewModels);

        viewModel.selectedTerrain = testProviderViewModel3;
        expect(centralBody.terrainProvider).toBe(testProvider3);
    });

    it('settings selectedImagery only removes layers added by view model', function() {
        var array = [testProviderViewModel];
        var centralBody = new MockCentralBody();
        var imageryLayers = centralBody.imageryLayers;
        var viewModel = new BaseLayerPickerViewModel(centralBody, array);

        expect(imageryLayers.length).toEqual(0);

        viewModel.selectedImagery = testProviderViewModel2;
        expect(imageryLayers.length).toEqual(2);
        expect(imageryLayers.get(0).imageryProvider).toBe(testProvider);
        expect(imageryLayers.get(1).imageryProvider).toBe(testProvider2);

        imageryLayers.addImageryProvider(testProvider3, 1);
        imageryLayers.remove(imageryLayers.get(0));

        viewModel.selectedImagery = undefined;

        expect(imageryLayers.length).toEqual(1);
        expect(imageryLayers.get(0).imageryProvider).toBe(testProvider3);
    });

    it('dropDownVisible and toggleDropDown work', function() {
        var viewModel = new BaseLayerPickerViewModel(new MockCentralBody());

        expect(viewModel.dropDownVisible).toEqual(false);
        viewModel.toggleDropDown();
        expect(viewModel.dropDownVisible).toEqual(true);
        viewModel.dropDownVisible = false;
        expect(viewModel.dropDownVisible).toEqual(false);
    });

    it('constructor throws with no centralBody', function() {
        expect(function() {
            return new BaseLayerPickerViewModel(undefined);
        }).toThrowDeveloperError();
    });

    it('constructor throws if viewModels argument is not an array', function() {
        var centralBody = new MockCentralBody();
        expect(function() {
            return new BaseLayerPickerViewModel(centralBody, {});
        }).toThrowDeveloperError();
    });
});