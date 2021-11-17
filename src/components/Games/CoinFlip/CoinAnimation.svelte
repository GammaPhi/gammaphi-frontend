<style>
    .coin {
      position: relative;
      margin: 0 auto;
      width: 120px;
      height: 120px;
      cursor: pointer;
      transition: transform 1s ease-in;
      transform-style: preserve-3d;
    }
    .side {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: absolute;
      backface-visibility: hidden;
    }
    .head {
      background-color: var(--primary-color);
      background-image: url('/static/images/phi_100.png');
      background-repeat: no-repeat;
      background-position: center;
      z-index: 10;
      border: 4px solid black;
      margin-top: -4px;
    }
    .tail {
        margin-top: -4px;
      background-color: var(--accent-color);
      transform: rotateX(-180deg);
      background-image: url('/static/images/phi_100.png');
      background-repeat: no-repeat;
      background-position: center;
      border: 4px solid black;
      
    }

    .flipHead {
      animation: resultHead 0s ease-out forwards;
    }
    .flipTail {
      animation: resultTail 0s ease-out forwards;
    }

    .flipping {
        animation: resultFlipping 60s ease-out forwards;
    }

    @keyframes resultFlipping {
      from {
        transform: rotateX(0);
      }
      to {
        transform: rotateX(19800deg);
      }
    }

    @keyframes resultHead {
      from {
        transform: rotateX(0);
      }
      to {
        transform: rotateX(180deg);
      }
    }

    @keyframes resultTail {
      from {
        transform: rotateX(0);
      }
      to {
        transform: rotateX(360deg);
      }
    }

    .row {
        margin-top: 1rem;
    }
  </style>

  <script>
    import { writable, derived, get } from "svelte/store";
    export let status;
    export let onClick;

    const flipClass = derived(status, $status => {
        if ($status === 'win') {
            return 'flipHead'
        } else if ($status === 'loss') {
            return 'flipTail'
        } else if ($status === 'approved' || $status === 'betting') {
            return 'flipping'
        } else {
            return 'flipHead'
        }
    })
  </script>

<div class="coin {$flipClass}" on:click={onClick}>
    <div class="side head"></div>
    <div class="side tail"></div>
</div>

{#if $status === 'win'}
<div class="row align-center buttons">
    You win!
</div>
{:else if $status === 'loss'}
<div class="row align-center buttons">
    You lost :(
</div>
{/if}