<template>
    <div class="flex flex-col min-h-screen">
        <NavBar />
        <main class="flex-1 container mx-auto p-4">
            <slot />
        </main>
    </div>
</template>