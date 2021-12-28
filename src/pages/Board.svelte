<script>
import Checkers from '../components/Games/Board/Checkers.svelte';
import Chess from '../components/Games/Board/Chess.svelte';
import Go from '../components/Games/Board/Go.svelte';
</script>


<style>
    .card.less-margin {
        padding-left: 0;
        padding-right: 0;
    }
</style>
<div align="middle" class="card less-margin">
    <Checkers />
    <Chess />
    <Go />
</div>

    