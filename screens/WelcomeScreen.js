import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.h1}>Odyssey</Text>
      <Image style={styles.logo} source={require("../assets/logo.png")} />
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.p}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.p}>Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  h1: {
    color: "black",
    fontSize: 32,
    marginBottom: 10,
  },
  logo: {
    width: 250,
    height: 200,
  },
  btn: {
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#FFD56D",
    padding: 10,
    width: "50%",
  },
  p: {
    textAlign: "center",
  },
});

export default WelcomeScreen;
