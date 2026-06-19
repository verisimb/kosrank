<?php

namespace App\Http\Requests;

use App\Models\Alternative;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAlternativeRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $alternative = $this->route('alternative');
        $alternativeId = $alternative instanceof Alternative ? $alternative->id : null;

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('alternatives', 'code')->ignore($alternativeId)],
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'code' => 'kode',
            'name' => 'nama kos',
            'location' => 'lokasi',
        ];
    }
}
