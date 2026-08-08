import React from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export const RazorpayCheckoutWebView = ({ route, navigation }) => {
  const { order, onSuccess, onFailure } = route.params;

  // This HTML will load Razorpay checkout in the WebView.
  // It simulates what normally happens on a web frontend.
  const razorpayHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { background-color: #ffffff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif;}
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #16a34a; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            p { margin-top: 20px; color: #64748b; font-size: 14px; }
            .container { text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="loader"></div>
            <p>Initializing Secure Payment...</p>
        </div>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
            var options = {
                "key": "dummy_key", // This should be replaced dynamically or using a test key
                "amount": "${order.amount}",
                "currency": "${order.currency}",
                "name": "Farmart",
                "description": "Order Payment",
                "order_id": "${order.id}",
                "handler": function (response) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'success', data: response }));
                },
                "modal": {
                    "ondismiss": function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'dismissed' }));
                    }
                },
                "theme": {
                    "color": "#16a34a"
                }
            };
            var rzp1 = new Razorpay(options);
            
            // Auto open the checkout
            setTimeout(function() {
                rzp1.open();
            }, 1000);
            
        </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const parsedData = JSON.parse(event.nativeEvent.data);
      if (parsedData.event === 'success') {
        // Here you would typically call your backend /api/verify-payment
        // For simplicity in the app, we pass the payment id to onSuccess
        navigation.goBack();
        onSuccess(parsedData.data.razorpay_payment_id);
      } else if (parsedData.event === 'dismissed') {
        navigation.goBack();
        if (onFailure) onFailure();
      }
    } catch (error) {
      console.log("Error parsing webview message", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => { navigation.goBack(); if(onFailure) onFailure(); }}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <WebView
        source={{ html: razorpayHtml }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center'
  }
});
