<template>
<div>
 <div class="login-banner"></div>
  <form @submit.prevent>
    <div class="container">
       
      <input type="text" placeholder="Enter Username" name="username" v-model="username" required>

      
      <input type="password" placeholder="Enter Password" name="psw" required>

      <router-link tag="button" to="/variation" class="login-button" @click.native.prevent="submitLogin()">Login</router-link>
    </div>
  </form>
  </div>
</template>


<script>
import axios from "axios";
import {EventBus} from '../main.js'
export default {
  data() {
    return {
      username:"",
      variation:""
    };
  },
  methods: {
    
    submitLogin() {
      let url = "http://localhost:3000/login";
      let param = {
        name: this.username,
        login: true
      };
      axios
        .post(url, param)
        .then(response => {
          console.log("response data",response.data);
          this.variation=response.data[0].variation;
          EventBus.getVariation(response.data[0]);
        })
        .catch(error => {
          console.log("error",error);
          this.login=false;
          EventBus.getLoginStatus(this.login);
        });
    }
  }
};
</script>

<style scoped>
form {
  /* border: 3px solid #f1f1f1; */
  max-width: 40%;
  margin: 0 auto;
  padding: 10px 0;
  /* border: 1px solid lightgray; */
  /* border-radius: 25px; */
}
/* Full-width inputs */
input[type="text"],
input[type="password"] {
  padding: 12px 20px;
  margin: 15px auto;
  display: inline-block;
  border: 0;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
  display: block;
  width: 100%;;
  outline: 0;
}
/* Set a style for all buttons */
.login-button {
  background-color: #4caf50;
  color: white;
  padding: 15px 40px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
  border-radius: 20px;
  font-size: 20px;
}
.container {
  width: 80%;
  font-family: monospace;
}
.login-banner {
  background-image: url('../assets/loginpage.jpg');
  height: 340px;
}
</style>