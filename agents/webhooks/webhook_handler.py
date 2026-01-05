"""
Webhook handler for task events
Integrates with Task Planner Agent
"""

from __future__ import annotations
from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
import json
from typing import Any

logger = logging.getLogger(__name__)

webhook_bp = Blueprint('webhooks', __name__, url_prefix='/webhooks')

# Storage for callbacks
webhook_callbacks: dict[str, Any] = {}

def register_callback(event_type: str, callback):
    """Register webhook callback"""
    webhook_callbacks[event_type] = callback
    logger.info(f"Registered callback for {event_type}")

@webhook_bp.route('/task/create', methods=['POST'])
async def webhook_task_create():
    """Handle task.create webhook"""
    try:
        payload = request.json or {}
        
        callback = webhook_callbacks.get('task.create')
        if callback:
            result = await callback(payload)
            return jsonify({
                'status': 'success',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }), 201
        
        return jsonify({'error': 'No callback registered'}), 400
    
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500

@webhook_bp.route('/task/complete', methods=['POST'])
async def webhook_task_complete():
    """Handle task.complete webhook"""
    try:
        payload = request.json or {}
        
        callback = webhook_callbacks.get('task.complete')
        if callback:
            result = await callback(payload)
            return jsonify({
                'status': 'success',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }), 200
        
        return jsonify({'error': 'No callback registered'}), 400
    
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500

@webhook_bp.route('/task/error', methods=['POST'])
async def webhook_task_error():
    """Handle task.error webhook"""
    try:
        payload = request.json or {}
        
        callback = webhook_callbacks.get('task.error')
        if callback:
            result = await callback(payload)
            return jsonify({
                'status': 'success',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }), 200
        
        return jsonify({'error': 'No callback registered'}), 400
    
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500

@webhook_bp.route('/task/status', methods=['POST'])
async def webhook_task_status():
    """Handle task.status webhook"""
    try:
        payload = request.json or {}
        
        callback = webhook_callbacks.get('task.status')
        if callback:
            result = await callback(payload)
            return jsonify({
                'status': 'success',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }), 200
        
        return jsonify({'error': 'No callback registered'}), 400
    
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500

@webhook_bp.route('/report/generate', methods=['POST'])
async def webhook_report_generate():
    """Handle report.generate webhook"""
    try:
        payload = request.json or {}
        
        callback = webhook_callbacks.get('report.generate')
        if callback:
            result = await callback(payload)
            return jsonify({
                'status': 'success',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }), 200
        
        return jsonify({'error': 'No callback registered'}), 400
    
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500

@webhook_bp.route('/batch/process', methods=['POST'])
async def webhook_batch_process():
    """Handle batch task processing"""
    try:
        payload = request.json or {}
        tasks = payload.get('tasks', [])
        operation = payload.get('operation', 'create')
        
        callback = webhook_callbacks.get(f'batch.{operation}')
        if callback:
            results = []
            for task_data in tasks:
                result = await callback(task_data)
                results.append(result)
            
            return jsonify({
                'status': 'success',
                'processed': len(results),
                'results': results,
                'timestamp': datetime.now().isoformat()
            }), 200
        
        return jsonify({'error': f'No callback for batch.{operation}'}), 400
    
    except Exception as e:
        logger.error(f"Batch webhook error: {e}")
        return jsonify({'error': str(e)}), 500

@webhook_bp.route('/health', methods=['GET'])
def webhook_health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'webhooks': list(webhook_callbacks.keys()),
        'timestamp': datetime.now().isoformat()
    }), 200

