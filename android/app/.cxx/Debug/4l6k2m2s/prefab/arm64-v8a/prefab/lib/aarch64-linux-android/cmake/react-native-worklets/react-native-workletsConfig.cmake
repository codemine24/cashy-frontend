if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "/Users/fazlyalahi/Documents/projects/codemine/cash-flow-fe-v2/node_modules/react-native-worklets/android/build/intermediates/cxx/Debug/2p571x1p/obj/arm64-v8a/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/fazlyalahi/Documents/projects/codemine/cash-flow-fe-v2/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

