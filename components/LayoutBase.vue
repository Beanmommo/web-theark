<template>
  <div class="layout-base">
    <header ref="header--fixed" class="header--fixed">
      <div>
        <slot name="header" />
      </div>
    </header>
    <header>
      <div>
        <slot name="header" />
      </div>
    </header>
    <main class="main">
      <div>

        <slot name="main" />
      </div>
    </main>

    <footer>
      <div>
        <slot name="footer" />
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.layout-base {
  display: flex;
  flex-direction: column;

  header,
  main,
  footer {
    width: 100%;
  }

  header {
    z-index: 1;
  }

  main {
    flex-grow: 1;
  }

  // footer>div {
  //   @media (min-width: $md) {
  //     padding-top: $margin-md;
  //   }
  // }

  header:first-child {
    position: fixed;
    background: $functional-white;
    box-shadow: $box-shadow;
  }

  // This is a duplicate header used to maintain in-flow spacing for the header.
  header:nth-child(2) {
    visibility: hidden;
  }

}
</style>
