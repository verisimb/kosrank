<?php

namespace App\Http\Requests;

use App\Enums\CriterionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreCriterionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('criteria', 'code')],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', new Enum(CriterionType::class)],
            'weight' => ['required', 'numeric', 'gt:0', 'max:100'],
            'unit' => ['nullable', 'string', 'max:50'],
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
            'name' => 'nama kriteria',
            'type' => 'jenis',
            'weight' => 'bobot',
            'unit' => 'satuan',
        ];
    }
}
