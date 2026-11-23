Project: Personal Engineering Portfolio

1. Mission

Build a premium, modern, bilingual personal portfolio for a Senior Backend Engineer specializing in Distributed Systems & Microservices.

The website should communicate engineering expertise, professional credibility, and technical curiosity through a polished, memorable visual experience.

This is a personal engineering portfolio, not a SaaS application, dashboard, or generic developer template.

Prioritize visual quality, clarity, performance, and simplicity.

The result should feel intentionally designed rather than assembled from standard UI components.

2. Core Principles

* Content-driven: Portfolio content must originate from the provided JSON files.
* Design-led: Treat visual quality and user experience as first-class requirements.
* Simple architecture: Build only what the portfolio actually needs.
* Maintainable: Content updates should not require component changes.
* Production-ready: The final result must be responsive, accessible, performant, and deployable.

Avoid unnecessary abstractions, dependencies, configuration layers, and architectural complexity.

3. Technology & Architecture

The project uses:

* Vue 3
* TypeScript
* Vite
* Vue Router
* Tailwind CSS
* Local JSON content
* GitHub Pages for hosting

Use the existing project setup and installed dependencies where appropriate.

Do not introduce a backend, database, CMS, authentication system, global state management library, or external content API.

Use Vue’s native capabilities wherever they are sufficient.

You have freedom to organize components, composables, and styles according to the project’s actual needs.

Favor readable, straightforward implementations over elaborate design patterns.

4. Content Contract

The portfolio has two content sources:

* src/data/en.json
* src/data/ar.json

Each file contains a complete representation of the portfolio in its respective language.

These files are the single source of truth for portfolio content.

Mandatory rules

* Never invent professional experience, projects, achievements, metrics, technologies, or personal information.
* Never replace provided content with generated placeholder text.
* Do not hardcode portfolio content inside Vue components.
* Render collections dynamically from JSON.
* Respect section visibility and ordering defined in the content.
* Handle missing or empty optional fields gracefully.
* Do not display empty cards, broken images, or nonfunctional links.
* Keep the implementation compatible with both JSON files.
* Do not modify the JSON schema without a compelling technical reason.

If content is incomplete, design around the available information rather than fabricating missing details.

UI presentation, visual effects, and decorative elements are not considered portfolio content and may be created freely.

5. Visual Design Direction

Design Identity: Technical Minimalism

Create a premium, dark-first portfolio with a refined, modern, editorial aesthetic.

The design should communicate engineering precision, technical sophistication, and professional credibility.

The visual experience should feel distinctive and intentionally crafted, not generated from a generic developer portfolio template.

Visual Language

* Theme: Dark-first, using deep charcoal and near-black surfaces.
* Typography: Strong, modern sans-serif typography with a clear hierarchy. Use large, expressive headings and highly readable body text.
* Accent: Choose one restrained accent color and use it consistently for emphasis and interaction.
* Layout: Spacious, balanced compositions with generous whitespace. Subtle asymmetry is encouraged where it improves visual interest.
* Surfaces: Refined cards and containers with subtle borders, understated contrast, and minimal visual noise.
* Backgrounds: Optional subtle grids, geometric details, or technical patterns that enhance the design without distracting from content.
* Icons: Minimal, consistent iconography.
* Imagery: Treat images as supporting elements rather than the foundation of the design.

Visual Hierarchy

The Hero should establish a strong first impression through typography, composition, and clear professional positioning.

Featured Work should receive significant visual emphasis because it demonstrates real-world engineering experience.

Engineering Lab should feel exploratory and technical while remaining consistent with the overall visual identity.

Skills, Experience, About, and Contact should maintain a clear hierarchy and comfortable reading experience.

Motion & Interaction

Use restrained, purposeful animation.

Favor subtle entrance transitions, refined hover states, and smooth interactive feedback.

Motion should reinforce hierarchy and improve perceived quality, not compete with the content.

Avoid excessive parallax, continuous decorative animation, and heavy animation libraries unless clearly justified.

Respect reduced-motion preferences.

Responsive & RTL Design

Treat mobile and Arabic RTL layouts as first-class design experiences.

Adapt compositions thoughtfully rather than simply shrinking or mirroring desktop layouts.

Maintain consistent visual quality, spacing, hierarchy, and interaction behavior across languages and screen sizes.

Design Freedom

You have creative freedom to choose:

* Exact colors and shades
* Typography and font combinations
* Layout compositions
* Card designs
* Decorative details
* Animation techniques
* Responsive adaptations

Make these decisions as part of one coherent design system.

Do not introduce unrelated visual styles between sections.

Avoid

* Generic developer portfolio templates
* Dashboard-like interfaces
* Excessive gradients, glows, or glassmorphism
* Overused terminal/code-window decorations
* Random technology logos as decorative backgrounds
* Crowded layouts
* Unnecessary visual complexity
* Inconsistent card styles
* Animations that compromise readability or performance

Design Quality Standard

The website should feel like a carefully art-directed personal portfolio.

Every section should have a clear purpose, a strong visual hierarchy, and a consistent relationship with the overall design system.

Prioritize thoughtful composition and visual refinement over adding more visual elements.

6. Page Structure & Interactions

The portfolio is a single-page experience.

Its primary sections are:

1. Hero
2. Featured Work
3. Engineering Lab
4. Technical Expertise
5. Professional Experience
6. About
7. Contact
8. Footer

Respect the visibility and ordering defined in the JSON content.

Featured Work and Engineering Lab represent different types of projects and should be visually distinguishable while remaining part of the same design system.

Project exploration

Project cards must support opening a drawer-based detail view.

Use a reusable drawer solution for both professional projects and Engineering Lab repositories.

The drawer should adapt to different project data without requiring project-specific implementations.

Make the interaction intuitive, responsive, accessible, and visually consistent with the rest of the website.

Motion & interaction

Use subtle, smooth animations to improve the experience.

Motion should feel purposeful rather than decorative.

Ensure that interactions remain responsive and respect reduced-motion preferences.

7. Localization

The website supports:

* English — LTR
* Arabic — RTL

English is the default language.

Both languages must receive the same level of design quality.

Requirements:

* Language switching must be seamless.
* Preserve the selected language when appropriate.
* Support shareable language-specific URLs.
* Apply correct document language and direction.
* Ensure layouts work naturally in both LTR and RTL.
* Avoid assumptions that all text flows left to right.
* Preserve technical terminology and proper nouns as provided in JSON.

Arabic must be treated as a first-class experience, not merely translated text inside an English layout.

8. Responsive Design & Accessibility

The website must work across mobile, tablet, and desktop screens.

Do not simply shrink the desktop layout for mobile.

Adapt composition, navigation, typography, and interactions appropriately.

Follow accessibility best practices, including:

* Semantic HTML
* Keyboard navigation
* Visible focus indicators
* Sufficient contrast
* Accessible interactive elements
* Appropriate image alternatives
* Reduced-motion support

Project drawers and navigation must remain usable with a keyboard.

9. Performance & SEO

The portfolio should load quickly and feel lightweight.

Prioritize:

* Minimal JavaScript
* Efficient asset loading
* Optimized images
* Avoiding unnecessary dependencies
* Preventing layout shifts
* Smooth interactions

Use the provided SEO content to configure page metadata.

Ensure language-specific metadata and document attributes are handled correctly.

Do not sacrifice performance for visual effects.

10. GitHub Pages Deployment

The website must be compatible with GitHub Pages.

Ensure that:

* Production builds work correctly.
* Static assets resolve correctly under the configured base path.
* Language-specific URLs work with the chosen routing strategy.
* Refreshing or directly opening a supported URL does not produce a broken page.
* No server-side runtime is required.

Prefer the simplest reliable deployment approach.

11. Engineering Standards

Write clean, maintainable, idiomatic Vue and TypeScript.

Prefer:

* Composition API
* Reusable components where reuse is justified
* Clear data flow
* Simple state management
* Consistent styling
* Type-safe data access

Avoid:

* Premature abstractions
* Excessive component fragmentation
* Unnecessary utility layers
* Duplicate rendering logic
* Hardcoded content
* Overly complex state management
* Unnecessary dependencies

Follow the project’s existing linting and formatting conventions.

12. Working Method

Before implementing a significant change:

1. Inspect the existing project structure and relevant JSON content.
2. Understand the intended behavior and design constraints.
3. Choose the simplest implementation that satisfies the requirements.
4. Preserve existing functionality and content compatibility.

During implementation:

* Work autonomously within the established boundaries.
* Make reasonable technical and visual decisions without requesting approval for every detail.
* Avoid unrelated refactoring.
* Do not introduce functionality outside the portfolio’s scope.
* Keep the implementation cohesive.

Ask for clarification only when a decision would materially change the product, violate the content contract, or require information that cannot be inferred safely.

13. Definition of Done

The portfolio is complete when:

* All enabled sections render correctly from JSON.
* Both English and Arabic work correctly.
* RTL and LTR layouts are polished.
* Project cards open functional drawers.
* The website is responsive across common screen sizes.
* Navigation and interactive elements work correctly.
* Missing optional content does not break the layout.
* No professional information has been fabricated.
* No broken links or missing required assets remain.
* The production build succeeds.
* The application is ready for GitHub Pages deployment.

A technically functional page is not sufficient.

The final result must also demonstrate strong visual quality, thoughtful interactions, and a cohesive design identity.

14. Final Guiding Principle

Build a portfolio that looks like it belongs to an experienced engineer, not a portfolio that merely lists an engineer’s technologies.

Use engineering discipline to keep the implementation simple and design judgment to make the experience exceptional.