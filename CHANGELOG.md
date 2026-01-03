# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 0.1.1 (2026-01-03)


### Features

* add automatic line styling for multiple marriages ([fab1c28](https://github.com/alexbrand/famtreejs/commit/fab1c280b50b5a78b59d9d188110dbd284e1bfc7))
* add TV/movie inspired family tree examples ([8c1b5c2](https://github.com/alexbrand/famtreejs/commit/8c1b5c2c5120180fe8c4d98f27e909cdb7d5f6dd))
* complete Phase 1 - Foundation ([75dd3a6](https://github.com/alexbrand/famtreejs/commit/75dd3a67b19ee188241d2ed675e53385db6986b9))
* complete Phase 2 - Interactivity ([377d0d1](https://github.com/alexbrand/famtreejs/commit/377d0d17a0bbce2b0265c628f400928e8f4a03a6))
* complete Phase 3 - API & State ([1925da3](https://github.com/alexbrand/famtreejs/commit/1925da33d14d7d55745a970f529522cc2cf2e4e9))
* complete Phase 4 & 5 - Polish and Release ([a77468f](https://github.com/alexbrand/famtreejs/commit/a77468f225f1271e4b78e0ce04b587cfdfb68e29))
* replace Skywalkers with Tudors example ([3ce8362](https://github.com/alexbrand/famtreejs/commit/3ce8362ef42e9e0b14e2d69e82a3cc5f0672ac83))


### Bug Fixes

* add missing null partner in Skywalkers example ([bc5a015](https://github.com/alexbrand/famtreejs/commit/bc5a015455ce81bffb4b89fc21ff70d532919db7))
* address critical code review issues ([64e38b1](https://github.com/alexbrand/famtreejs/commit/64e38b19067334ba98dd34ef90d6c16c9246c9d3))
* connect child lines to actual node position ([eade30b](https://github.com/alexbrand/famtreejs/commit/eade30b57f5aa86fc672016344ab64555d86dbd6))
* improve node spacing and line connections ([c708177](https://github.com/alexbrand/famtreejs/commit/c70817765374ea00fae8e290e98449344959631e))
* improve rendering and card sizing ([d98fe14](https://github.com/alexbrand/famtreejs/commit/d98fe148c8607f867dd81e32c9692f8e257ad75a))
* prevent infinite loop in FamilyTreeWithProvider callback registration ([cddbe11](https://github.com/alexbrand/famtreejs/commit/cddbe11ba2df5e17235b4aa89fe302d7edbc449e))
* prevent infinite loop in useEffect for fitToView ([a1c74d1](https://github.com/alexbrand/famtreejs/commit/a1c74d13e1c562e4b8f4e886aebd69da6bd68c38))
* resolve critical ESLint and type safety issues ([c2074ed](https://github.com/alexbrand/famtreejs/commit/c2074edb82f926b3bf6feee30f6f4dfec555ec0f))
* resolve medium severity issues from code review ([93dd155](https://github.com/alexbrand/famtreejs/commit/93dd1554b56b5747ff0589107ad080b7c4d8ccf9))
* update CSS module declaration for side-effect imports ([f5acb22](https://github.com/alexbrand/famtreejs/commit/f5acb22cefcc62ac3c2202b4ecb7c8ed5e1edf82))

## [0.1.0] - 2026-01-03

### Added

- **Core FamilyTree Component**: React component for rendering interactive family trees
- **Partnership-Centric Data Model**: Partnerships are first-class entities with children descending from unions
- **Multiple Orientations**: Support for top-down, bottom-up, left-right, and right-left layouts
- **Pan & Zoom**: Smooth pan and zoom with mouse/touch gestures
- **Node Selection & Hover**: Click and hover events with visual feedback
- **Customizable Node Components**: Bring your own React component for rendering person nodes
  - Includes `BasicPersonCard` and `DetailedPersonCard` default components
- **State Management via Hooks**: `useFamilyTreeState` and `useFamilyTreeActions` for external control
- **Imperative API via Ref**: Access methods like `zoomTo`, `centerOnPerson`, `fitToView`, `expandAll`
- **Multi-Marriage Styling**: Automatic color and dash pattern differentiation for multiple partnerships
- **CSS Custom Properties**: Full theming support via CSS variables
- **TypeScript Support**: Full type definitions included

### Technical Details

- Built with React 18+, TypeScript, Zustand, and Framer Motion
- ESM-only package
- Vite-based build system
