<!-- 
<span v-for="i in 3"> span: {{ i }} </span>

```typescript

```

```typescript

```

<RedDiv>
{{replacements}}
<pre>{{prompt}}</pre>
{{formatted}}
</RedDiv>

<div class="flex">
  <button style="width:7em" @click="changeRole">{{currentRole}}</button>
  <input ref="inputField" v-model="inputFieldValue" />
  <button @click="addToPrompt">Click Me!</button>
</div>

<code class="language-typescript line-numbers-mode">
<pre contenteditable @blur="onDataEditBlur" :class="{'json-invalid': !dataFieldValid}" class="language-typescript line-numbers-mode" data-ext="ts">
{{JSON.stringify({
  "name":"Greg",
  "colors": ["red", "blue", "green"]
}, undefined, 2)}}
</pre>
</code>


<script setup>
import { h, ref, reactive, watchEffect } from 'vue'

import {createChatPrompt}  from "../../../../../build/src/prompt/_functions"

const RedDiv = (_, ctx) => h(
  'div',
  {
    class: 'red-div',
  },
  ctx.slots.default()
)
const inputField = ref(null)
const inputFieldValue = ref("")


const dataField = ref(null)
const dataFieldValue = ref("")
const dataFieldValid = ref(true)

const currentRole = ref("system")

const formatted = ref("")
const prompt = reactive(createChatPrompt("hi {{Name}}") )
const messages = reactive(prompt.messages)
let replacements = ref({})

const json = ref("");
 
function changeRole(){
  const roles = ["system", "assistant", "user"]
  const current = roles.indexOf(currentRole.value);
  if(current + 1 < roles.length){
    currentRole.value = roles[current + 1]
  }else{
    currentRole.value = "system"
  }
}

function addToPrompt(){
 const role = currentRole.value;
 prompt.addToPrompt(inputFieldValue.value,role )
 inputFieldValue.value = "";
}

function onDataEditBlur(fff){
  try{
    const res = JSON.parse(fff.target.innerText)
    fff.target.innerText = JSON.stringify(res, undefined, 2);
    replacements.value = res
    dataFieldValid.value = true;
  }catch(e){
    console.log(e)
    replacements.value = {};
    dataFieldValid.value = false;
  }

}

watchEffect(() => {
  if(messages.length && replacements.value && Object.keys(replacements.value)){
  console.log(replacements, inputField.value)
    formatted.value = prompt.format(replacements.value)
  }else{
    formatted.value = ""
  }

})

</script>

<style>
.json-invalid {
  border:1px solid red;
}
  </style> -->
