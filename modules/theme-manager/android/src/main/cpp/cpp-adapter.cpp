#include <jni.h>
#include "thememanagerOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::thememanager::initialize(vm);
}
