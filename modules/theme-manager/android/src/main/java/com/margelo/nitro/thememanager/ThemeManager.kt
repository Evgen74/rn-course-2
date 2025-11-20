package com.margelo.nitro.thememanager
import android.content.ComponentCallbacks
import android.content.Context
import android.content.res.Configuration
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules@DoNotStrip

class ThemeManager : HybridThemeManagerSpec() {
  private val listeners = mutableListOf<(ThemeManagerPayload) -> Unit>()
  private val PREFS_NAME = "theme-manage"
  private val K_APP_THEME = "AppTheme"
  private val K_APP_PALLETTE = "AppPallette"

  private val appContext: Context by lazy {
    NitroModules.applicationContext
      ?: throw IllegalStateException("Application context not available")
  }

  private val prefs by lazy {
    appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
  }

  init {
    appContext.registerComponentCallbacks(object : ComponentCallbacks {
      override fun onConfigurationChanged(newConfig: Configuration) {
        notifyListeners()
      }
      override fun onLowMemory() { /* no-op */ }
    })
  }


  private fun getSystemTheme(): Theme {
    val nightMask = appContext.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
    return if (nightMask == Configuration.UI_MODE_NIGHT_YES) Theme.DARK else Theme.LIGHT
  }

  private fun stringToFullTheme(raw: String?): FullTheme = when (raw) {
    "auto" -> FullTheme.AUTO
    "light" -> FullTheme.LIGHT
    "dark" -> FullTheme.DARK
    else -> FullTheme.AUTO
  }

  private fun fullThemeToString(value: FullTheme): String = when (value) {
    FullTheme.AUTO -> "auto"
    FullTheme.LIGHT -> "light"
    FullTheme.DARK -> "dark"
  }

  private fun stringToPallette(raw: String?): Palette = when (raw) {
    "Default" -> Palette.DEFAULT
    "SkyBlue" -> Palette.SKYBLUE
    "Green" -> Palette.GREEN
    else -> Palette.DEFAULT
  }

  private fun palletteToString(value: Palette): String = when (value) {
    Palette.DEFAULT -> "Default"
    Palette.SKYBLUE -> "SkyBlue"
    Palette.GREEN -> "Green"
  }

  private fun readFullTheme(): FullTheme {
    val raw = prefs.getString(K_APP_THEME, "auto")
    return stringToFullTheme(raw)
  }

  private fun writeFullTheme(value: FullTheme) {
    prefs.edit().putString(K_APP_THEME, fullThemeToString(value)).apply()
  }

  private fun readPallette(): Palette {
    val raw = prefs.getString(K_APP_PALLETTE, "Default")
    return stringToPallette(raw)
  }

  private fun writePallette(value: Palette) {
    prefs.edit().putString(K_APP_PALLETTE, palletteToString(value)).apply()
  }

  private fun notifyListeners() {
    val payload = ThemeManagerPayload(theme, palette, fullTheme)
    listeners.forEach { listener ->
      try { listener.invoke(payload) } catch (_: Throwable) { }
    }
  }

  override val theme: Theme
    get() = when (readFullTheme()) {
      FullTheme.AUTO -> getSystemTheme()
      FullTheme.LIGHT -> Theme.LIGHT
      FullTheme.DARK -> Theme.DARK
    }

  override val fullTheme: FullTheme
    get() = readFullTheme()

  override val palette: Palette
    get() = readPallette()

  override fun setTheme(theme: FullTheme) {
    writeFullTheme(theme)
    notifyListeners()
  }

  override fun setPalette(palette: Palette) {
    writePallette(palette)
    notifyListeners()
  }

  override fun listen(onThemeChange: (payload: ThemeManagerPayload) -> Unit) {
    listeners.add(onThemeChange)
  }
}
