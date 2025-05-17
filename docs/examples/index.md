# Examples

<ExamplesFilters @change="changeFilters" />
<ExamplesBlocks :filter-group="filters" />

<script setup lang="ts">
import { ref } from 'vue'

const filters = ref([]);

function changeFilters(_filters: string[]){
    filters.value = _filters;
}

</script>
