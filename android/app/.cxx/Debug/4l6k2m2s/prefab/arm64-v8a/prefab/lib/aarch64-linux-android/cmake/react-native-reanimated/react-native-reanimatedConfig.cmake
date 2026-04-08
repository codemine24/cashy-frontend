if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "/Users/fazlyalahi/Documents/projects/codemine/cash-flow-fe-v2/node_modules/react-native-reanimated/android/build/intermediates/cxx/Debug/05t5c70c/obj/arm64-v8a/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/fazlyalahi/Documents/projects/codemine/cash-flow-fe-v2/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

