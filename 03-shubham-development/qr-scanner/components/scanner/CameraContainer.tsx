import React from 'react';
import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { Text, TouchableOpacity, View } from 'react-native';

import { scannerStyles as styles } from './styles';

export type CameraContainerProps = {
  granted: boolean;
  onRequestPermission: () => void;
  onScan: (result: BarcodeScanningResult) => void;
};

export function CameraContainer({ granted, onRequestPermission, onScan }: CameraContainerProps) {
  return (
    <View style={styles.cameraShell}>
      {granted ? (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onScan}
          />
          <ScanOverlay />
        </View>
      ) : (
        <View style={[styles.cameraWrapper, styles.centered]}>
          <Text style={styles.muted}>Camera permission required</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onRequestPermission}>
            <Text style={styles.primaryButtonText}>Enable camera</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function ScanOverlay() {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <View style={styles.overlayTop} />

      <View style={styles.overlayCenter}>
        <View style={styles.overlaySide} />

        <View style={styles.focusBox}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          <View style={styles.scanLine} />
        </View>

        <View style={styles.overlaySide} />
      </View>

      <View style={styles.overlayBottom}>
        <Text style={styles.overlayText}>Align the QR within the frame</Text>
        <Text style={styles.overlaySubtext}>Keep it steady and well lit</Text>
      </View>
    </View>
  );
}
