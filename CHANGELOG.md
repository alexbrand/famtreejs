# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-03

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

- Built with React 18+, TypeScript, Zustand, D3, and Framer Motion
- ESM-only package
- Vite-based build system
