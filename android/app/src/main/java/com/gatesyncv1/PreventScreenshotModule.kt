package com.gatesyncv1

import android.app.Activity
import android.util.Log
import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PreventScreenshotModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PreventScreenshotModule"
    }

    @ReactMethod
    fun enableSecureMode() {
        val activity: Activity? = currentActivity
        if (activity != null) {
            Log.d("PreventScreenshotModule", "Enabling secure mode")
            activity.runOnUiThread {
                activity.window.setFlags(
                    WindowManager.LayoutParams.FLAG_SECURE,
                    WindowManager.LayoutParams.FLAG_SECURE
                )
            }
        } else {
            Log.e("PreventScreenshotModule", "Failed to enable secure mode: currentActivity is null")
        }
    }

    @ReactMethod
    fun disableSecureMode() {
        val activity: Activity? = currentActivity
        if (activity != null) {
            Log.d("PreventScreenshotModule", "Disabling secure mode")
            activity.runOnUiThread {
                activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
            }
        } else {
            Log.e("PreventScreenshotModule", "Failed to disable secure mode: currentActivity is null")
        }
    }
}
