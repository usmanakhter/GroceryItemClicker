// React Native starter app using Expo
// Features: Type input for grocery items, login to Jewel-Osco or Mariano's via WebView, search items via injected input for Mariano's

import React, { useState, useRef, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, TextInput, Modal } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  const [typedText, setTypedText] = useState("");
  const [items, setItems] = useState([]);
  const [showWebView, setShowWebView] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const webViewRef = useRef(null);

  const handleTextSubmit = () => {
    const parsed = typedText.split(",").map(item => item.trim()).filter(item => item);
    setItems(parsed);
    setTypedText("");
  };

  const getCouponURL = () => {
    if (selectedStore === 'jewel' && items.length > 0) {
      const keyword = encodeURIComponent(items[0]);
      return `https://www.jewelosco.com/foru/coupons-deals.html?q=${keyword}&tab=products`;
    }
    return selectedStore === 'marianos' ? `https://www.marianos.com/savings/cl/coupons/` : '';
  };

  const injectSearchScript = () => {
    if (selectedStore === 'marianos' && items.length > 0) {
      const keyword = items[0];
      return `
        setTimeout(() => {
          const input = document.querySelector('input[placeholder="Search Coupons"]');
          if (input) {
            input.value = "${keyword}";
            input.dispatchEvent(new Event('input', { bubbles: true }));
            const button = input.nextElementSibling;
            if (button) {
              button.click();
            }
          }
        }, 3000);
      `;
    }
    return "";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Coupon Clipper</Text>
      <TextInput
        style={styles.input}
        placeholder="Type grocery items separated by commas (e.g. milk, eggs, bread)"
        value={typedText}
        onChangeText={setTypedText}
        onSubmitEditing={handleTextSubmit}
        returnKeyType="done"
      />
      <Button title="Add Items" onPress={handleTextSubmit} />
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        )}
      />
      <View style={styles.buttonGroup}>
        <View style={styles.storeButton}><Button title="Search Jewel-Osco Coupons" onPress={() => { setSelectedStore('jewel'); setShowWebView(true); }} /></View>
        <View style={styles.storeButton}><Button title="Search Mariano's Coupons" onPress={() => { setSelectedStore('marianos'); setShowWebView(true); }} /></View>
      </View>

      <Modal visible={showWebView} animationType="slide">
        <View style={{ flex: 1 }}>
          <Button title="Close" onPress={() => setShowWebView(false)} />
          <WebView
            ref={webViewRef}
            source={{ uri: getCouponURL() }}
            injectedJavaScript={injectSearchScript()}
            javaScriptEnabled={true}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  item: {
    padding: 12,
    backgroundColor: "#e0f7fa",
    marginBottom: 10,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 18,
  },
  buttonGroup: {
    marginTop: 30,
    paddingBottom: 100,
    justifyContent: 'flex-start',
  },
  storeButton: {
    marginBottom: 30,
  },
});
