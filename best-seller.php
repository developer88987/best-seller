<?php
/**
 * Plugin Name: Best Seller
 * Description: Adds a Gutenberg block to select book genres.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL2
 */

defined('ABSPATH') || exit;

function best_seller_enqueue_block_assets() {
    wp_enqueue_script(
        'best-seller-block',
        plugins_url('block.js', __FILE__),
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
        filemtime(plugin_dir_path(__FILE__) . 'block.js')
    );

    wp_enqueue_script(
        'best-seller-block-index',
        plugins_url('build/index.js', __FILE__),
        array('wp-blocks', 'wp-element', 'wp-editor'),
        filemtime(plugin_dir_path(__FILE__) . 'build/index.js')
    );
    
    wp_enqueue_style(
        'best-seller-editor-style',
        plugins_url('editor.css', __FILE__),
        array('wp-edit-blocks'),
        filemtime(plugin_dir_path(__FILE__) . 'editor.css')
    );
}

add_action('enqueue_block_editor_assets', 'best_seller_enqueue_block_assets');
