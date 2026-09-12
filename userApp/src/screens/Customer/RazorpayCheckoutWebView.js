import React from "react";
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export const RazorpayCheckoutWebView = ({ route, navigation }) => {
  const { order, keyId, onSuccess, onFailure } = route.params;
  const orderAmount = JSON.stringify(String(order?.amount || "0"));
  const orderCurrency = JSON.stringify(order?.currency || "INR");
  const razorpayKey = JSON.stringify(keyId || "dummy_key");
  const razorpayOrderId = JSON.stringify(order?.id || "dummy_order");

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
        <script src="https://checkout.razorpay.com/v1/checkout.js" onload="openCheckout()"></script>
        <script>
          function openCheckout() {
            if (!window.ReactNativeWebView) {
               setTimeout(openCheckout, 100);
               return;
            }

            var options = {
                "key": ${razorpayKey},
                "amount": ${orderAmount},
                "currency": ${orderCurrency},
                "name": "sfarmart",
                "description": "Order Payment",
                "order_id": ${razorpayOrderId},
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
            try {
              if (!options.key || options.key === "dummy_key") {
                 throw new Error("Invalid Razorpay Key provided by server");
              }
              var rzp1 = new Razorpay(options);
              rzp1.open();
            } catch (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'error', message: error.message }));
            }
          }
        </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const parsedData = JSON.parse(event.nativeEvent.data);
      if (parsedData.event === "success") {
        // Here you would typically call your backend /api/verify-payment
        // For simplicity in the app, we pass the payment id to onSuccess
        navigation.goBack();
        onSuccess(parsedData.data);
      } else if (parsedData.event === "dismissed") {
        navigation.goBack();
        if (onFailure) onFailure();
      } else if (parsedData.event === "error") {
        navigation.goBack();
        if (onFailure) onFailure(parsedData.message);
      }
    } catch (error) {
      console.log("Error parsing webview message", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            navigation.goBack();
            if (onFailure) onFailure();
          }}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <WebView
        source={{
          html: razorpayHtml,
          baseUrl: "https://checkout.razorpay.com",
        }}
        originWhitelist={["*"]}
        onMessage={handleMessage}
        onError={() => {
          navigation.goBack();
          if (onFailure) onFailure("Unable to load Razorpay checkout.");
        }}
        onHttpError={() => {
          navigation.goBack();
          if (onFailure)
            onFailure("Razorpay checkout returned a network error.");
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        mixedContentMode="compatibility"
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
  },
});
