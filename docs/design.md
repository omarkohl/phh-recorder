# Design Decisions

Some documentation why certain decisions were made.

## Frontend Only

The decision to make this a frontend only application was made to keep the
project simple and easy to maintain. This way, the project can be hosted on
GitHub Pages without the need for a backend server.

## UI Components

In particular, we needed a combobox to choose the player and actions.

Some options considered were:

* https://github.com/jquense/react-widgets: Looks great, maintained, 2.3k stars
* https://github.com/tailwindlabs/headlessui: 25.8k stars, created and
  maintained by the Tailwind team, which already is a dependency that we are
  using.
* https://mui.com/: Might slightly conflict with Tailwind CSS, and it includes a
  lot of things that we probably don't need. Also, the open core principle is
  always a little tricky, we might make ourselves dependent on a paid feature in
  the future.

For the reasons above, we chose to use `headlessui`.

## No Game Logic / Poker Engine

The decision to not include a poker engine was made to keep the project simple.
We are considering adding this as a server component
using [pokerkit](https://github.com/uoftcprg/pokerkit) later on.
The communication could be modelled on
the [cardroom](https://github.com/uoftcprg/cardroom) application's PFN (poker
frame notation) and websockets. It's not a fully natural fit because for our use
case the client is making decisions that in a normal Poker game are made by the
server e.g. what cards are dealt.

Other alternatives would be to add (or copy and extend) a JavaScript/TypeScript
poker engine like:

* https://github.com/claudijo/poker-ts
* https://github.com/Mikhail-MM/React-Poker
* https://github.com/frannyfx/holdem
* https://github.com/benjaminrathelot/javascript-poker-engine
* https://github.com/mjhbell/node-poker
