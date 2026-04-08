if(NOT TARGET react-native-nitro-modules::NitroModules)
add_library(react-native-nitro-modules::NitroModules SHARED IMPORTED)
set_target_properties(react-native-nitro-modules::NitroModules PROPERTIES
    IMPORTED_LOCATION "/Users/fazlyalahi/Documents/projects/codemine/cash-flow-fe-v2/node_modules/react-native-nitro-modules/android/build/intermediates/cxx/Debug/u4225346/obj/arm64-v8a/libNitroModules.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/fazlyalahi/Documents/projects/codemine/cash-flow-fe-v2/node_modules/react-native-nitro-modules/android/build/headers/nitromodules"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

