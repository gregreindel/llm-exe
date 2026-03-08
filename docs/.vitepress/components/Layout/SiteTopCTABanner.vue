<template>
    <div id="top-cta-banner" v-if="!hidden">
        <div id="top-cta-close" @click="hide">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                style="width:16px;height:16px">
                <path fill-rule="evenodd"
                    d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z"
                    clip-rule="evenodd" />
            </svg>

        </div>
        <div id="top-cta-banner-inner">
            <span>Store Chat Messages & State Without Managing Infrastructure.</span>
            <span style="display:flex;align-items: center;">
                <a class="marker-highlight marker-highlight-yellow"
                    href="https://dialoguedb.com?utm_source=llm-exe&utm_medium=website&utm_campaign=cta"
                    target="_blank">Check Out DialogueDB</a>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                    style="width:17px;height:17px">
                    <path fill-rule="evenodd"
                        d="M2 8c0 .414.336.75.75.75h8.69l-1.22 1.22a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 1 0-1.06 1.06l1.22 1.22H2.75A.75.75 0 0 0 2 8Z"
                        clip-rule="evenodd" />
                </svg>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'top-cta-banner-hidden';
const hidden = ref(false);

onMounted(() => {
    const storedValue = sessionStorage.getItem(STORAGE_KEY);
    if (storedValue === 'true') {
        hidden.value = true;
    }
});

function hide() {
    hidden.value = true;
    sessionStorage.setItem(STORAGE_KEY, 'true');
}
</script>

<style lang="css" scoped>
#top-cta-banner {
    background: #5f17ff;
    color: #fff;
    position: fixed;
    width: 100%;
    left: 0;
    bottom: 0;
    z-index: 999;
    padding: 12px 24px;
}

#top-cta-close {
    position: absolute;
    right: 20px;
    top: 12px;
}

#top-cta-banner-inner {
    display: flex;
    justify-content: center;
    align-items: center;

}

#top-cta-banner-inner a {
    font-weight: 500;
    margin-left: 12px;
}


@media (max-width: 767px) {

    #top-cta-banner {
        padding: 8px 12px;
    }

    #top-cta-banner-inner {
        flex-direction: column;
        text-align: center;
    }

    #top-cta-banner-inner span {
        font-size: 14px;
    }
}
</style>