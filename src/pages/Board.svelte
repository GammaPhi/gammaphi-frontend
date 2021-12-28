<script>
import { writable } from 'svelte/store';

import Checkers from '../components/Games/Board/Checkers.svelte';
import Chess from '../components/Games/Board/Chess.svelte';
import Go from '../components/Games/Board/Go.svelte';
import Lobby from '../components/Games/Board/Lobby.svelte';
import Link from '../components/Link.svelte';

const game_type = writable(null);

</script>


<style>
    .card.less-margin {
        padding-left: 0;
        padding-right: 0;
    }
</style>
<div align="middle" class="card less-margin">
    {#if $game_type === null}
        <Link clazz={"large"} onClick={()=>game_type.set('chess')}>Play Chess</Link>
        <br /><br />
        <Chess playable={false} />
        <br /><br />
        <Link clazz={"large"} onClick={()=>game_type.set('checkers')}>Play Checkers</Link>
        <br /><br />
        <Checkers playable={false} />
        <br /><br />
        <Link clazz={"large"} onClick={()=>game_type.set('go')}>Play Go</Link>
        <br /><br />
        <Go playable={false} />
        <br /><br />
    {:else}
        <Lobby game_type={$game_type} goBack={()=>game_type.set(null)} />
    {/if}
</div>

    