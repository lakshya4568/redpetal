import React, { Component, ErrorInfo, ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <Pressable
            onPress={this.handleReload}
            style={styles.button}
            android_ripple={{ color: "rgba(238, 43, 59, 0.2)" }}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FFF5F5",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFCDD2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#E53935",
    // Android text rendering fix
    ...(Platform.OS === "android" && {
      includeFontPadding: false,
      textAlignVertical: "center",
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1E293B",
    textAlign: "center",
    ...(Platform.OS === "android" && {
      includeFontPadding: false,
    }),
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
    color: "#64748B",
    lineHeight: 22,
    paddingHorizontal: 16,
    ...(Platform.OS === "android" && {
      includeFontPadding: false,
    }),
  },
  button: {
    backgroundColor: "#EE2B3B",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: "#EE2B3B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    ...(Platform.OS === "android" && {
      includeFontPadding: false,
    }),
  },
});

export default ErrorBoundary;
