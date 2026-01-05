plugins {
    id("java-library")
    id("software.amazon.smithy.gradle.smithy-jar").version("0.10.1")
}

repositories {
    mavenLocal()
    mavenCentral()
}

val smithyVersion by extra("1.51.0")

dependencies {
    smithyCli("software.amazon.smithy:smithy-cli:$smithyVersion")

    // Add the Smithy TypeScript code generator dependency
    implementation("software.amazon.smithy.typescript:smithy-typescript-codegen:0.36.1")
}
