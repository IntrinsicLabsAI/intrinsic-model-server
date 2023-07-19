# vendor

This workspace is for friendly-licensed upstream deps that we need to change for whatever reason.

Currently, this includes

* `@uiw/react-textarea-code-editor`: We've made modifications to avoid pulling in the syntax highlighting plugins which increase bundle size considerably.
