<?php

namespace App\Exceptions;

use Exception;

/**
 * Thrown when the SAW calculation cannot be performed because the input data
 * is incomplete or would lead to an invalid operation (e.g. division by zero).
 */
class SawCalculationException extends Exception
{
    //
}
