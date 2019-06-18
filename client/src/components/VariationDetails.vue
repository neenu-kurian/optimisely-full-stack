<template>
<div class="container">
    <div v-if="!this.login">
        <p>The username is invalid , please try again</p>
         <router-link tag="button" to="/" class="login-button">Go back to Login Page</router-link>
    </div>
    <div v-else="this.login">
        <div v-if="this.variation==='Menu_1'">
            <h1>{{ variation }}</h1>
            <hr>
            <h4>-------------Appetizers-------------</h4>
            <h4>Grilled Brussel Sports</h4>
            <h4>-------------Entrees----------------</h4>
            <h4>Salmon</h4>
            <h4>-------------Desserts----------------</h4>
             <h4>CheeseCake</h4>
        </div>
        <div v-else="this.variation==='Menu_2'">
            <h1>{{ variation }}</h1>
            <hr>
            <h4>-------------Appetizers-------------</h4>
            <h4>Garlic Bread</h4>
            <h4>-------------Entrees----------------</h4>
            <h4>Chicken Parm</h4>
            <h4>-------------Desserts---------------</h4>
            <h4>Chocolate Cake</h4>
        </div>
    
        <br>
        <div v-if="this.featureEnabled">
             The feature is enabled.
            <div> Tonight we are also offering a prix fixe meal for $100, are you interested?Type y if interested</div>
            <input type="text" v-model="prixfixemeal" @keyup="submitUserChoice()">
        </div>
        <div v-if="this.prixfixemeal==='y'">
            <div> Coming Right Up!</div>
             <div> Would you like an appetiser</div>
             <input type="text" v-model="appetizer" @keyup="submitAppetizer()">
            <div> Would you like an entree</div>
            <input type="text" v-model="entree" @keyup="submitEntree()">
             <div>Would you like a dessert</div>
            <input type="text" v-model="dessert" @keyup="submitDessert()">
        </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from "../main.js";
import axios from "axios";

export default {
  data() {
    return {
      variation: "",
      featureEnabled:"",
      appetizer:"",
      dessert:"",
      entree:"",
      prixfixemeal:"",
      appetizer:"",
      entree:"",
      dessert:"",
      login:true
    };
  },
  methods: {
    submitUserChoice() {
        let url="http://localhost:3000/userinput";
        let param = {
          prixfixemeal: this.prixfixemeal
        };
       axios
        .post(url, param)
        .then(response => {
          console.log("user choice",response.data);
        })
        .catch(error => {
          console.log(error);
        }); 
    },
    submitAppetizer() {
        let url="http://localhost:3000/appetizer";
        let param = {
          appetizer: this.appetizer
        };
       axios
        .post(url, param)
        .then(response => {
          console.log("user choice app ",response.data);
        })
        .catch(error => {
          console.log(error);
        }); 
    },
    submitEntree() {
        let url="http://localhost:3000/entree";
        let param = {
          entree: this.entree
        };
       axios
        .post(url, param)
        .then(response => {
          console.log("user choice entree",response.data);
        })
        .catch(error => {
          console.log(error);
        }); 
    },
    submitDessert() {
        let url="http://localhost:3000/dessert";
        let param = {
          dessert: this.dessert
        };
       axios
        .post(url, param)
        .then(response => {
          console.log("user choice dessert",response.data);
        })
        .catch(error => {
          console.log(error);
        }); 
    }
  },
  created() {
    EventBus.$on("variation", data => {
      this.variation = data.variation;
      this.featureEnabled = data.enabled;
      // this.appetizer= data.appetizer;
      // this.dessert = data.dessert;
      // this.entree = data.entree;
      this.login=true;
    });
     EventBus.$on("loginerror", data => {
      this.login=data;
    });
  }
};
</script>


<style scoped>
.container {
    border: 5px double lightslategray;
    border-radius: 30px;
    background-image: url('../assets/menubackground.jpg');
    padding: 30px 0;
    max-width: 40%;
    box-shadow:inset 0 0 0 1000px rgba(0,0,0,.6);
    color: white;
    font-style: italic;
    font-family: monospace;
}
</style>
