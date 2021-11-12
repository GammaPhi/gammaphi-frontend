<script>
export let value;

</script>


<style>
.dice {
    background-color: var(--accent-color);
    width: 40px;
    height: 40px;
    border: 2px solid var(--primary-color);
    text-align: center;
    vertical-align: middle;
    display: inline-flex;
    border-radius: 5px;
}
.dice span {
    width: 100%;
    margin: auto;
    color: var(--color-gray-4);
    font-size: 20px;
    font-weight: bolder;
}
</style>


<div class="dice">
<span>
    {$value}
</span>   
</div>