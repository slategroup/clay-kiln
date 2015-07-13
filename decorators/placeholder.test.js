var dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./placeholder'),
  references = require('../services/references');

describe(dirname, function () {
  describe(filename, function () {
    var sandbox;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    describe('getPlaceholderText', function () {
      var fn = lib[this.title],
        mockName = 'foo.bar';

      it('does not support _placeholder: {string}', function () {
        // we used to support _placeholder: 'some string of text'
        // but we don't anymore.
        // if you want to specify placeholder text, put it in the `text` property
        // e.g. _placeholder: { text: 'some string of text' }
        expect(fn(mockName, {_placeholder: 'Bar'})).to.equal('Foo » Bar');
      });

      it('uses placeholder text if it exists', function () {
        expect(fn(mockName, {_placeholder: {text: 'Baz'}})).to.equal('Baz');
      });

      it('falls back to label if no placeholder text', function () {
        expect(fn(mockName, {_placeholder: 'true'})).to.equal('Foo » Bar');
        expect(fn(mockName, {_placeholder: true})).to.equal('Foo » Bar');
      });
    });

    describe('getPlaceholderHeight', function () {
      var fn = lib[this.title];

      it('gets height when set explicitly', function () {
        expect(fn({_placeholder: {height: '500px'}})).to.equal('500px');
      });

      it('gets auto height when set explicitly', function () {
        expect(fn({_placeholder: {height: 'auto'}})).to.equal('auto');
      });

      it('falls back to 100px height', function () {
        expect(fn({_placeholder: {text: 'This is some text'}})).to.equal('100px');
        expect(fn({_placeholder: true})).to.equal('100px');
        expect(fn({_placeholder: 'true'})).to.equal('100px');
      });
    });

    describe('isFieldEmpty', function () {
      var fn = lib[this.title];

      it('is true if null', function () {
        expect(fn({value: null})).to.equal(true);
      });
      it('is true if empty string', function () {
        expect(fn({value: ''})).to.equal(true);
      });
      it('is true if empty array', function () {
        expect(fn([])).to.equal(true);
      });
      it('is true if empty obj', function () {
        expect(fn({})).to.equal(true);
      });
      it('is true if empty array w/ schema', function () {
        var emptyWithSchema = [];

        emptyWithSchema._schema = {};
        expect(fn(emptyWithSchema)).to.equal(true);
      });
      it('is true if empty obj w/ schema', function () {
        var emptyWithSchema = [];

        emptyWithSchema._schema = {};
        expect(fn(emptyWithSchema)).to.equal(true);
      });

      it('is false if string w/ characters', function () {
        expect(fn({value: '123'})).to.equal(false);
      });
      it('is false if number', function () {
        expect(fn({value: 123})).to.equal(false);
      });
      it('is false if array w/ values', function () {
        expect(fn({value: [1, 2, 3]})).to.equal(false);
      });
    });

    function stubNode() {
      var node = document.createElement('div');

      node.setAttribute(references.editableAttribute, 'title');
      return node;
    }

    describe('when', function () {
      var fn = lib[this.title];

      it('returns true if field and blank', function () {
        var stubData = {
          value: '',
          _schema: {
            _has: 'text',
            _placeholder: true
          }
        };

        expect(fn(stubNode(), {data: stubData, ref: 'fakeRef', path: 'title'})).to.equal(true);
      });

      it('returns false if field and not blank', function () {
        var stubData = {
          value: 'asdf',
          _schema: {
            _has: 'text',
            _placeholder: true
          }
        };

        expect(fn(stubNode(), {data: stubData, ref: 'fakeRef', path: 'title'})).to.equal(false);
      });

      it('returns false if not field', function () {
        var stubData = {
          value: '',
          _schema: {
            _placeholder: true
          }
        };

        expect(fn(stubNode(), {data: stubData, ref: 'fakeRef', path: 'title'})).to.equal(false);
      });
    });

    describe('handler', function () {
      var fn = lib[this.title];

      it('adds placeholder', function () {
        var stubData = {
          value: '',
          _schema: {
            _has: 'text',
            _placeholder: true
          }
        },
        newNode = fn(stubNode(), {data: stubData, ref: 'fakeRef', path: 'title'});

        expect(newNode.querySelector('.editor-placeholder').style.minHeight).to.equal('100px');
        expect(newNode.querySelector('span.placeholder-label').textContent).to.equal('Title');
      });
    });
  });
});