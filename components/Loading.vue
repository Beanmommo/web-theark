<script>
export default {
  props: ["message"],
  data()
  {
    return {
      dialog: true
    };
  }
};
</script>

<template>
  <v-dialog persistent width="300" v-model="dialog">
    <v-card color="grey darken-4" dark class="text-center pa-8">
      <v-row wrap>
        <v-col cols="12">
          <div class="d-flex justify-center">
            <div class="fulfilling-bouncing-circle-spinner">
              <div class="circle"></div>
              <div class="orbit"></div>
            </div>
          </div>
        </v-col>
        <v-col cols="12">
          <b>{{ message }}</b>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>



<style>
.fulfilling-bouncing-circle-spinner,
.fulfilling-bouncing-circle-spinner * {
  box-sizing: border-box;
}

.fulfilling-bouncing-circle-spinner {
  height: 60px;
  width: 60px;
  position: relative;
  animation: fulfilling-bouncing-circle-spinner-animation infinite 4000ms ease;
}

.fulfilling-bouncing-circle-spinner .orbit {
  height: 60px;
  width: 60px;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  border: calc(60px * 0.03) solid #00c853;
  animation: fulfilling-bouncing-circle-spinner-orbit-animation infinite 4000ms ease;
}

.fulfilling-bouncing-circle-spinner .circle {
  height: 60px;
  width: 60px;
  color: #76ff03;
  display: block;
  border-radius: 50%;
  position: relative;
  border: calc(60px * 0.1) solid #76ff03;
  animation: fulfilling-bouncing-circle-spinner-circle-animation infinite 4000ms ease;
  transform: rotate(0deg) scale(1);
}

@keyframes fulfilling-bouncing-circle-spinner-animation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fulfilling-bouncing-circle-spinner-orbit-animation {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1);
  }

  62.5% {
    transform: scale(0.8);
  }

  75% {
    transform: scale(1);
  }

  87.5% {
    transform: scale(0.8);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes fulfilling-bouncing-circle-spinner-circle-animation {
  0% {
    transform: scale(1);
    border-color: transparent;
    border-top-color: inherit;
  }

  16.7% {
    border-color: transparent;
    border-top-color: initial;
    border-right-color: initial;
  }

  33.4% {
    border-color: transparent;
    border-top-color: inherit;
    border-right-color: inherit;
    border-bottom-color: inherit;
  }

  50% {
    border-color: inherit;
    transform: scale(1);
  }

  62.5% {
    border-color: inherit;
    transform: scale(1.4);
  }

  75% {
    border-color: inherit;
    transform: scale(1);
    opacity: 1;
  }

  87.5% {
    border-color: inherit;
    transform: scale(1.4);
  }

  100% {
    border-color: transparent;
    border-top-color: inherit;
    transform: scale(1);
  }
}</style>
