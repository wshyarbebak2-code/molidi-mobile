import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useApp } from "@/context/AppContext";

export function Toast() {
  const { toast } = useApp();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: toast.type === "success" ? "#065f46" : "#7f1d1d" }]}>
      <Text style={styles.text}>{toast.msg}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
});
