const sinon = require('sinon')
const { assert, expect } = require( 'chai' );
const {webpack} = require( '../config' );

describe( 'webpack', function() {
  describe( 'props', function ( ) {

    it( 'should define an object', function () {
      assert.isObject( webpack );
    } );

    it( 'should define an getProp method', function () {
      assert.isFunction( webpack.getProp );
    } );

    it( 'should define an setProp method', function () {
      assert.isFunction( webpack.setProp );
    } );

    it( 'should define an reload method', function () {
      assert.isFunction( webpack.reload );
    } );

  } );

  describe( 'method', function ( ) {

    describe( 'setPreset', function () {
      describe( 'when passed other value than "drupal"', function(){
        it( 'should throw', function () {
          assert.throws( () => webpack.setPreset('wordpress'), Error );
        } );
      } );
    } );

    describe( 'addPlugin', function () {
      var pluginParams = {
        funcWithName(){
          return {
            name: 'test',
            plugin: function(){}
          }
        },
        funcWithoutName(){
          return {
            plugin: function(){}
          }
        },
        funcWithoutPlugin(){
          return {
            name: 'test'
          }
        }
      }

      beforeEach(function(){
        webpack.options.plugins.test = { test: 'option' }
        sinon.spy(pluginParams, 'funcWithName');
      });

      afterEach(function(){
        pluginParams.funcWithName.restore();
      });

      describe( 'when passed param is not a function', function(){
        it( 'should throw', function () {
          assert.throws( () => webpack.addPlugin(), Error );
        } );
      } );

      describe( 'when returned plugin config does not have a name', function(){
        it( 'should throw', function () {
          assert.throws( () => webpack.addPlugin(pluginParams.funcWithoutName), Error );
        } );
      } );

      describe( 'when returned plugin config does not have a plugin', function(){
        it( 'should throw', function () {
          assert.throws( () => webpack.addPlugin(pluginParams.funcWithoutPlugin), Error );
        } );
      } );
    } );

    describe( 'setProp', function () {
      describe( 'when passed name is undefined', function(){
        it( 'should throw', function () {
          assert.throws( () => webpack.setProp(null), Error );
        } );
      } );

      describe( 'when passed name is a string', function(){
        it( 'if is empty should throw', function () {
          assert.throws( () => webpack.setProp(' '), Error );
        } );
      } );

      describe( 'when passed name is not a string', function(){
        it( 'should throw', function () {
          assert.throws( () => webpack.setProp({}), Error );
        } );
      } );

      describe( 'when passed name is valid', function(){

        describe( 'when passed value is a function', function(){
          it( 'should add it to cache', function () {
            webpack.setProp('test', () => {});
            assert.isFunction(webpack.propsCache['test']);
          } );

          it( 'should invoke it', function () {
            webpack.setProp('test', function () { this.config.foo = 'bar' });
            assert.property(webpack.config, 'foo');
          } );
        } );

        describe( 'when passed value is not a function', function(){
          it( 'should add it to config object', function () {
            webpack.setProp('test', { first: 'first' });
            assert.property(webpack.config, 'test');
          } );
        } );

      } );
    } );

    describe( 'getProp', function () {
      describe( 'when passed name is undefined', function(){
        it( 'should throw', function () {
          assert.throws( () => webpack.getProp(), Error );
        } );
      } );

      describe( 'when passed name is not a string', function(){
        it( 'should throw', function () {
          assert.throws( () => webpack.getProp({}), Error );
        } );
      } );

      describe( 'when passed name is a string', function(){
        describe( 'when is empty', function(){
          it( 'should throw', function () {
            assert.throws( () => webpack.getProp(''), Error );
          } );
        } );
      } );
    } );

    describe( 'reload', function () {
      beforeEach(function(){
        for (let key in webpack.propsCache) {
          if (webpack.propsCache.hasOwnProperty(key)) {
            sinon.spy(webpack.propsCache, key);
          }
        }
      });

      afterEach(function(){
        for (let key in webpack.propsCache) {
          if (webpack.propsCache.hasOwnProperty(key)) {
            webpack.propsCache[key].restore();
          }
        }
      });

      describe( 'when passed name is undefined', function(){
        it('should call them all', function(){
          webpack.reload();
          for (let key in webpack.propsCache) {
            if (webpack.propsCache.hasOwnProperty(key)) {
              sinon.assert.calledOnce(webpack.propsCache[key]);
            }
          }
        });
      } );

      describe( 'when passed name is array', function(){
        it('call the ones in the array', function(){
          webpack.setProp('test_1', () => 'Test function');
          webpack.setProp('test_2', () => 'Test function');

          sinon.spy(webpack.propsCache, 'test_1');
          sinon.spy(webpack.propsCache, 'test_2');

          webpack.reload(['test_1', 'test_2']);

          sinon.assert.calledOnce(webpack.propsCache['test_1']);
          sinon.assert.calledOnce(webpack.propsCache['test_2']);
        });
      } );

      describe( 'when passed name is string', function(){
        it('call one by name', function(){
          webpack.reload('test');
          sinon.assert.calledOnce(webpack.propsCache['test']);
        });
      } );

      describe( 'should return the instance', function(){
        const actual = webpack.reload();
        assert.equal(actual, webpack);
      } );
    } );

    describe( 'apply', function () {
      beforeEach(function(){
        webpack.apply({ config: { test: true } });
      });

      it('should apply new configuration', function(){
        assert.equal(webpack.options.config.test, true);
      });

    } );

    describe( 'sync', function () {

      beforeEach(function(){
        sinon.spy(webpack, 'addPlugin');
        webpack.sync({ test: true });
      });

      afterEach(function(){
        webpack.addPlugin.restore();
      });

      it('should set a BrowserSyncPlugin property to options.plugins array', function(){
        assert.equal(webpack.options.plugins.BrowserSyncPlugin.test, true);
      });

      it('should have called addPlugin method', function(){
        sinon.assert.calledOnce(webpack.addPlugin);
      });

      it('should return instance', function(){
        assert.isObject(webpack.sync({ test: true }));
      });
    } );

    describe( 'provide', function () {

      beforeEach(function(){
        sinon.spy(webpack, 'addPlugin');
        webpack.provide({ test: true });
      });

      afterEach(function(){
        webpack.addPlugin.restore();
      });

      it('should set a provide property to options.plugins array', function(){
        assert.equal(webpack.options.plugins.provide.test, true);
      });

      it('should have called addPlugin method', function(){
        sinon.assert.calledOnce(webpack.addPlugin);
      });

      it('should return instance', function(){
        assert.isObject(webpack.provide({ test: true }));
      });
    } );

    describe( 'visualize', function () {

      beforeEach(function(){
        sinon.spy(webpack, 'addPlugin');
        webpack.visualize({ test: true });
      });

      afterEach(function(){
        webpack.addPlugin.restore();
      });

      it('should set a BundleAnalyzerPlugin property to options.plugins array', function(){
        assert.equal(webpack.options.plugins.BundleAnalyzerPlugin.test, true);
      });

      it('should have called addPlugin method', function(){
        sinon.assert.calledOnce(webpack.addPlugin);
      });

      it('should return instance', function(){
        assert.isObject(webpack.visualize({ test: true }));
      });
    } );

  } );
} );
